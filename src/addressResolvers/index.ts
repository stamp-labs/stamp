import * as ensResolver from './ens';
import * as lensResolver from './lens';
import * as unstoppableDomainResolver from './unstoppableDomains';
import { Address, normalizeAddresses } from './utils';
import cache from './cache';

const RESOLVERS = [ensResolver, unstoppableDomainResolver, lensResolver];
const MAX_LOOKUP_ADDRESSES = 250;

export async function lookupAddresses(addresses: Address[]) {
  if (addresses.length > MAX_LOOKUP_ADDRESSES) {
    return Promise.reject({
      error: `params must contains less than ${MAX_LOOKUP_ADDRESSES} addresses`,
      code: 400
    });
  }

  return Object.fromEntries(
    Object.entries(
      await cache(normalizeAddresses(addresses), async (addresses: Address[]) => {
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
