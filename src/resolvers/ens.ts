import axios from 'axios';
import { getProvider, resize } from '../utils';
import { max } from '../constants.json';

export default async function resolve(name: string) {
  try {
    const provider = getProvider(1);
    const ensResolver = await provider.getResolver(name);
    if (!ensResolver) {
      return false;
    }

    const url = await ensResolver.getText('avatar');
    if (!url || !url.startsWith('http')) {
      return false;
    }

    const input = (await axios({ url, responseType: 'arraybuffer' })).data as Buffer;

    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
