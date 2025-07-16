import { Address, Handle, EMPTY_ADDRESS } from '../utils';
import shibarium from './shibarium';
import unstoppableDomains from './unstoppableDomains';

const RESOLVERS = [shibarium, unstoppableDomains];

export default async function getOwner(handle: Handle, chainId = '1'): Promise<Address> {
  const resolverPromises = RESOLVERS.map(async resolver => {
    try {
      return await resolver(handle, chainId);
    } catch {
      return null;
    }
  });

  const results = await Promise.all(resolverPromises);
  return results.find(Boolean) || EMPTY_ADDRESS;
}
