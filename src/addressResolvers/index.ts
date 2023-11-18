import { getAddress } from '@ethersproject/address';
import * as ensResolver from './ens';
import * as lensResolver from './lens';
import * as unstoppableDomainsesolver from './unstoppableDomains';
import { Address } from './utils';
import cache from './cache';

const RESOLVERS = [ensResolver, unstoppableDomainsesolver, lensResolver];

export async function lookupAddresses(addresses: Address[]) {
  if (addresses.length > 250) {
    return Promise.reject({ error: 'params must contains less than 250 addresses', code: 400 });
  }

  let normalizedAddresses: Address[];
  try {
    normalizedAddresses = addresses.map(a => getAddress(a));
  } catch (e) {
    return Promise.reject({ error: 'params contains invalid address', code: 400 });
  }

  return cache(normalizedAddresses, async (addresses: Address[]) => {
    const results = await Promise.all(RESOLVERS.map(r => r.lookupAddresses(addresses)));

    return Object.fromEntries(
      addresses.map(address => {
        return [address, results.map(r => r[address]).filter(handle => !!handle)[0] || ''];
      })
    );
  });
}
