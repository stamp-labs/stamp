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

    let url = await ensResolver.getText('avatar');
    if (!url || !url.startsWith('http')) {
      url = `https://metadata.ens.domains/mainnet/avatar/${name}`;
    }

    const input = (await axios({ url, responseType: 'arraybuffer' })).data as Buffer;

    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
