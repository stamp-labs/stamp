import { Address, mapOriginalInput, normalizeAddresses } from '../addressResolvers/utils';
import * as lensFollowing from './lens';

const PROVIDERS = [lensFollowing];

export default async function following(addresses: Address[]) {
  if (addresses.length !== 1) {
    return Promise.reject({
      error: `params must contain 1 item`,
      code: 400
    });
  }

  const normalizedAddresses = Array.from(new Set(normalizeAddresses(addresses)));

  // TODO: Add cache
  const result = await Promise.all(
    PROVIDERS.flatMap(provider => {
      try {
        return provider.following(normalizedAddresses[0]);
      } catch (e) {
        return [];
      }
    })
  );

  return mapOriginalInput(addresses, { [normalizedAddresses[0]]: result.flat() }) as Record<
    Address,
    Address[]
  >;
}
