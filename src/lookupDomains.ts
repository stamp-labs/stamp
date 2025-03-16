import snapshot from '@snapshot-labs/snapshot.js';
import { capture } from '@snapshot-labs/snapshot-sentry';
import { EMPTY_ADDRESS, isSilencedError } from './addressResolvers/utils';
import { Address, graphQlCall } from './utils';
import { provider as getProvider } from './addressResolvers/utils';
import { isAddress } from '@ethersproject/address';
import { namehash } from '@ethersproject/hash';
import constants from './constants.json';

const DEFAULT_CHAIN_ID = '1';

type Domain = {
  name: string;
  labelName?: string;
  expiryDate?: number;
};

async function fetchDomainData(domain: Domain, chainId: string): Promise<Domain> {
  const hash = domain.name.match(/\[(.*?)\]/)?.[1];

  if (!hash) return domain;

  const {
    data: { data }
  } = await graphQlCall(
    constants.ensSubgraph[chainId],
    `query Registration {
      registration(id: "0x${hash}") {
        domain {
          name
          labelName
        }
      }
    }`
  );
  const labelName = data?.registration?.domain?.labelName;

  return {
    ...domain,
    name: labelName ? domain.name.replace(`[${hash}]`, labelName) : domain.name
  };
}

/*
 * see https://docs.ens.domains/registry/reverse
 */
async function getDomainFromReverseRegistrar(
  address: Address,
  chainId: string
): Promise<Domain | null> {
  const provider = getProvider(chainId);
  const abi = ['function name(bytes32 node) view returns (string r)'];
  const reverseName = `${address.toLowerCase().substring(2)}.addr.reverse`;
  const hash = namehash(reverseName);
  const resolver = await provider.getResolver(reverseName);

  if (!resolver) {
    return null;
  }

  const resolverAddress = await resolver.address;

  if (!resolverAddress || resolverAddress === EMPTY_ADDRESS) {
    return null;
  }

  const domainName = await snapshot.utils.call(provider, abi, [resolverAddress, 'name', [hash]]);

  return { name: domainName };
}

export default async function lookupDomains(
  address: Address,
  chainId = DEFAULT_CHAIN_ID
): Promise<Address[]> {
  if (!isAddress(address) || !constants.ensSubgraph[chainId]) return [];

  let domains: Domain[] = [];

  try {
    const {
      data: {
        data: { account }
      }
    } = await graphQlCall(
      constants.ensSubgraph[chainId],
      `query Domain {
        account(id: "${address.toLowerCase()}") {
          domains {
            name
            expiryDate
          }
          wrappedDomains {
            name
            expiryDate
          }
        }
      }`
    );

    const now = (Date.now() / 1000).toFixed(0);
    domains = [...(account?.domains || []), ...(account?.wrappedDomains || [])].filter(
      domain =>
        (!domain.expiryDate || domain.expiryDate === '0' || domain.expiryDate > now) &&
        !domain.name.endsWith('.addr.reverse')
    );
  } catch (e) {
    if (!isSilencedError(e)) {
      capture(e, { input: { address } });
    }
  }

  try {
    const results = await Promise.allSettled([
      ...domains.map(domain => fetchDomainData(domain, chainId)),
      getDomainFromReverseRegistrar(address, chainId)
    ]);

    return results
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => (result as PromiseFulfilledResult<Domain>).value.name);
  } catch (e) {
    if (!isSilencedError(e)) {
      capture(e, { input: { address } });
    }
    return [];
  }
}
