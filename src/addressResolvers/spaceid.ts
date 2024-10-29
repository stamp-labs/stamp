import { createWeb3Name } from '@web3-name-sdk/core';
import { Address } from '../utils';

export async function resolveName(name: string): Promise<Address | undefined> {
  try {
    const web3name = createWeb3Name();
    const address = await web3name.getAddress(name);
    if (address) {
      return address;
    }
    return undefined;
  } catch (error) {
    console.log('resolveNameError: ', error);
    return undefined;
  }
}
