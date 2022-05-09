import axios from 'axios';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { resize } from '../utils';
import { max } from '../constants.json';


export default async function resolve(address) {
  try {
    const provider = new StaticJsonRpcProvider('https://rpc.ankr.com/eth');
    const name = await provider.lookupAddress(address);
    if (name) {
      const resolver = await provider.getResolver(name);
      const avatar = await resolver?.getAvatar();
      const url = avatar?.url;
      const input = (await axios({ url, responseType: 'arraybuffer' })).data as Buffer;
      return await resize(input, max, max);
    }
  } catch (e) {
    return false;
  }
}
