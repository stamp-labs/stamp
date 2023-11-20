import { getAddress } from '@ethersproject/address';
import * as ensResolver from './ens';
import * as lensResolver from './lens';
import * as unstoppableDomainResolver from './unstoppableDomains';
import cache from './cache';
import { Address } from './utils';

const RESOLVERS = [ensResolver, unstoppableDomainResolver, lensResolver];
const MAX_LOOKUP_ADDRESSES = 250;

export async function resolveName(handle: string): Promise<string | null> {
  if (handle.endsWith('.ens')) {
    return ensResolver.resolveName(handle);
  } else if (handle.endsWith('.lens')) {
    return lensResolver.resolveName(handle);
  } else {
    return unstoppableDomainResolver.resolveName(handle);
  }
}

export async function lookupAddresses(addresses: Address[]) {
  if (addresses.length > MAX_LOOKUP_ADDRESSES) {
    return Promise.reject({
      error: `params must contains less than ${MAX_LOOKUP_ADDRESSES} addresses`,
      code: 400
    });
  }

  let normalizedAddresses: Address[];
  try {
    normalizedAddresses = addresses.map(getAddress);
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
