import { Address, Handle } from '../utils';
import ens, { SUPPORTED_CHAINS as ENS_CHAINS } from './ens';

const RESOLVERS = {
  ens: {
    supportedChains: ENS_CHAINS,
    lookup: ens
  }
};

export default async function lookupDomains(address: Address, chain: string): Promise<Handle[]> {
  const promises: Promise<Handle[]>[] = [];

  Object.values(RESOLVERS).forEach(({ supportedChains, lookup }) => {
    if (supportedChains.includes(chain)) {
      promises.push(lookup(address, chain));
    }
  });
  const ensDomains = await Promise.all(promises);

  return ensDomains.flat();
}
