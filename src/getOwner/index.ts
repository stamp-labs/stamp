import { Address, Handle } from '../utils';
import shibarium from './shibarium';

export default async function getOwner(handle: Handle, chainId = '1'): Promise<Address> {
  return shibarium(handle, chainId);
}
