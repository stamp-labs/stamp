import { getAddress } from '@ethersproject/address';
import * as ensResolver from './ens';
import * as lensResolver from './lens';
import * as unstoppableDomainResolver from './unstoppableDomains';
import cache from './cache';
import { Address, Handle } from './utils';

const RESOLVERS = [ensResolver, unstoppableDomainResolver, lensResolver];
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

export async function resolveName(handle: Handle): Promise<Address | undefined> {
  const results = await cache([handle], async (h: Handle[]) => {
    let address: Address | undefined;
    const _handle = h[0];

    if (_handle.endsWith('.eth')) {
      address = await ensResolver.resolveName(_handle);
    } else if (_handle.endsWith('.lens')) {
      address = await lensResolver.resolveName(_handle);
    } else {
      address = await unstoppableDomainResolver.resolveName(_handle);
    }

    return { [handle]: address };
  });

  return results[handle];
}
