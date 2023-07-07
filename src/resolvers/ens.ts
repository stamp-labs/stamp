import axios from 'axios';
import { getProvider, resize } from '../utils';
import { max } from '../constants.json';

export default async function resolve(address: string) {
  try {
    const provider = getProvider(1);
    const url = await provider.getAvatar(address);
    if (!url) return false;
    const input = (await axios({ url, responseType: 'arraybuffer' })).data as Buffer;
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
