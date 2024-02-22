import { getProvider, resize } from '../utils';
import { max } from '../constants.json';
import { fetchHttpImage } from './utils';

export default async function resolve(name: string) {
  try {
    const provider = getProvider(1);
    const ensResolver = await provider.getResolver(name);
    if (!ensResolver) {
      return false;
    }

    let url = await ensResolver.getText('avatar');
    url = url?.startsWith('http') ? url : `https://metadata.ens.domains/mainnet/avatar/${name}`;

    const input = await fetchHttpImage(url);

    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
