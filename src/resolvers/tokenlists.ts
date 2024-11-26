import { resize } from '../utils';
import { max } from '../constants.json';
import { fetchHttpImage } from './utils';
import { findImageUrl, updateExpiredAggregatedTokenList } from '../helpers/tokenlists';

export default async function resolve(address: string, chainId: string) {
  try {
    await updateExpiredAggregatedTokenList();
    const url = findImageUrl(address, chainId);
    const image = await fetchHttpImage(url);

    return await resize(image, max, max);
  } catch (e) {
    return false;
  }
}
