import { getAddress } from '@ethersproject/address';
import * as ensResolver from './ens';
import * as lensResolver from './lens';
import * as unstoppableDomainsesolver from './unstoppableDomains';
import { Address } from './utils';

const RESOLVERS = [ensResolver, unstoppableDomainsesolver, lensResolver];

export async function lookupAddresses(addresses: Address[]) {
  const normalizedAddresses = addresses.slice(0, 250).map(a => getAddress(a));

  const [ens, ud, lens] = await Promise.all(
    RESOLVERS.map(r => r.lookupAddresses(normalizedAddresses))
  );

  return Object.fromEntries(
    normalizedAddresses.map(address => {
      return [address, ens[address] || lens[address] || ud[address] || ''];
    })
  );
}
