import { capture } from '@snapshot-labs/snapshot-sentry';
import { Address, FetchError, graphQlCall, isSilencedError } from './addressResolvers/utils';

const ENS_GRAPHQL_URL = 'https://api.thegraph.com/subgraphs/name/ensdomains/ens';

type Domain = {
  name: string;
  labelName?: string;
  expiryDate?: number;
};

async function fetchDomainData(domain: Domain): Promise<Domain> {
  const hash = domain.name.match(/\[(.*?)\]/)?.[1];

  if (!hash) return domain;

  const {
    data: {
      data: {
        registration: {
          domain: { labelName }
        }
      }
    }
  } = await graphQlCall(
    ENS_GRAPHQL_URL,
    `
      query Registration($id: String!) {
        registration(id: "0x${hash}") {
          domain {
            name
            labelName
          }
        }
      }
    `
  );

  return {
    ...domain,
    name: labelName ? domain.name.replace(`[${hash}]`, labelName) : domain.name
  };
}

export default async function lookupDomains(address: Address): Promise<Address[]> {
  if (!address) return [];

  try {
    const {
      data: {
        data: {
          account: { domains, wrappedDomains }
        }
      }
    } = await graphQlCall(
      ENS_GRAPHQL_URL,
      `
      query Domain {
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
      }
     `
    );

    const now = (Date.now() / 1000).toFixed(0);
    const allDomains: Domain[] = [...domains, ...wrappedDomains].filter(
      domain =>
        domain &&
        (!domain.expiryDate || domain.expiryDate === '0' || domain.expiryDate > now) &&
        !domain.name.endsWith('.addr.reverse')
    );

    return (await Promise.all(allDomains.map(fetchDomainData))).map(domain => domain.name) || [];
  } catch (e) {
    if (!isSilencedError(e)) {
      capture(e, { input: { address } });
    }
    throw new FetchError();
  }
}
