import { getAddress } from '@ethersproject/address';
import * as ensResolver from './ens';
import * as lensResolver from './lens';
import * as unstoppableDomainsesolver from './unstoppableDomains';
import { Address } from './utils';
import cache from './cache';

const RESOLVERS = [ensResolver, unstoppableDomainsesolver, lensResolver];
const MAX_LOOKUP_ADDRESSES = 250;

export async function lookupAddresses(addresses: Address[]) {
  if (addresses.length > MAX_LOOKUP_ADDRESSES) {
    return Promise.reject({
      error: `params must contains less than ${MAX_LOOKUP_ADDRESSES} addresses`,
      code: 400
    });
  }

  let normalizedAddresses: Address[];
  try {
    normalizedAddresses = addresses.map(a => getAddress(a));
  } catch (e) {
    return Promise.reject({ error: 'params contains invalid address', code: 400 });
  }

  return Object.fromEntries(
    Object.entries(
      await cache(normalizedAddresses, async (addresses: Address[]) => {
        const results = await Promise.all(RESOLVERS.map(r => r.lookupAddresses(addresses)));

        return Object.fromEntries(
          addresses.map(address => [
            address,
            results.map(r => r[address]).filter(handle => !!handle)[0] || ''
          ])
        );
      })
    ).filter(([, handle]) => handle)
  );
}
