import { getAddress } from '@ethersproject/address';
import * as ensResolver from './ens';
import * as lensResolver from './lens';
import * as unstoppableDomainsesolver from './unstoppableDomains';
import { Address } from './utils';
import cache from './cache';

const RESOLVERS = [ensResolver, unstoppableDomainsesolver, lensResolver];

export async function lookupAddresses(addresses: Address[]) {
  const normalizedAddresses = addresses.slice(0, 250).map(a => getAddress(a));

  return cache(normalizedAddresses, async (addresses: Address[]) => {
    const [ens, ud, lens] = await Promise.all(RESOLVERS.map(r => r.lookupAddresses(addresses)));

    return Object.fromEntries(
      addresses.map(address => {
        return [address, ens[address] || lens[address] || ud[address] || ''];
      })
    );
  });
}
