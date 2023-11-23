import * as ensResolver from './ens';
import * as lensResolver from './lens';
import * as unstoppableDomainResolver from './unstoppableDomains';
import cache from './cache';
import { Address, Handle, normalizeAddresses, withoutEmptyValues } from './utils';

const RESOLVERS = [ensResolver, unstoppableDomainResolver, lensResolver];
const MAX_LOOKUP_ADDRESSES = 250;
const MAX_RESOLVE_NAMES = 5;

export async function lookupAddresses(addresses: Address[]) {
  if (addresses.length > MAX_LOOKUP_ADDRESSES) {
    return Promise.reject({
      error: `params must contains less than ${MAX_LOOKUP_ADDRESSES} addresses`,
      code: 400
    });
  }

  return withoutEmptyValues(
    await cache(normalizeAddresses(addresses), async (addresses: Address[]) => {
      const results = await Promise.all(RESOLVERS.map(r => r.lookupAddresses(addresses)));

      return Object.fromEntries(
        addresses.map(address => [
          address,
          results.map(r => r[address]).filter(handle => !!handle)[0] || ''
        ])
      );
    })
  );
}

export async function resolveNames(handles: Handle[]): Promise<Record<Handle, Address>> {
  if (handles.length > MAX_RESOLVE_NAMES) {
    return Promise.reject({
      error: `params must contains less than ${MAX_RESOLVE_NAMES} handles`,
      code: 400
    });
  }

  return withoutEmptyValues(
    await cache(handles, async (handles: Handle[]) => {
      const results = await Promise.all(RESOLVERS.map(r => r.resolveNames(handles)));
      return Object.fromEntries(
        handles.map(handle => [
          handle,
          results.map(r => r[handle]).filter(address => !!address)[0] || ''
        ])
      );
    })
  );
}
