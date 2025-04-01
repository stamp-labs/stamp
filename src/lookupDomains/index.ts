import { isAddress } from '@ethersproject/address';
import { Address, Handle } from '../utils';
import ens, { SUPPORTED_CHAINS as ENS_CHAINS } from './ens';
import shibarium, { SUPPORTED_CHAINS as SHIBARIUM_CHAINS } from './shibarium';

const RESOLVERS = {
  ens: {
    supportedChains: ENS_CHAINS,
    lookup: ens
  },
  shibarium: {
    supportedChains: SHIBARIUM_CHAINS,
    lookup: shibarium
  }
};

export default async function lookupDomains(
  address: Address,
  chains: string | string[] = ['1']
): Promise<Handle[]> {
  const promises: Promise<Handle[]>[] = [];
  const chainIds = Array.isArray(chains) ? chains : [chains];

  if (!isAddress(address)) return [];

  Object.values(RESOLVERS).forEach(({ supportedChains, lookup }) => {
    chainIds.forEach(chain => {
      if (supportedChains.includes(chain)) {
        promises.push(lookup(address, chain));
      }
    });
  });

  const domains = await Promise.all(promises);

  return domains.flat();
}
