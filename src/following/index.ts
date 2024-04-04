import { Address, normalizeAddresses } from '../addressResolvers/utils';
import * as lensFollowing from './lens';

const PROVIDERS = [lensFollowing];

export default async function following(address: Address): Promise<Address[]> {
  const normalizedAddress = normalizeAddresses([address])[0];

  if (!normalizedAddress) return [];

  // TODO: Add cache
  const result = await Promise.all(
    PROVIDERS.flatMap(provider => {
      try {
        return provider.following(normalizedAddress);
      } catch (e) {
        return [];
      }
    })
  );

  return result.flat();
}
