import { getAddress } from '@ethersproject/address';
import { resize } from '../utils';
import { max } from '../constants.json';
import { fetchHttpImage } from './utils';
import { initAggregatedTokenList } from '../helpers/tokenlists';

async function findImageUrl(address: string, chainId: string) {
  const checksum = getAddress(address);

  const aggregatedTokenList = await initAggregatedTokenList();

  const token = aggregatedTokenList.find(token => {
    return token.chainId === parseInt(chainId) && getAddress(token.address) === checksum;
  });
  if (!token) throw new Error('Token not found');

  return token.logoURI;
}

export default async function resolve(address: string, chainId: string) {
  try {
    const url = await findImageUrl(address, chainId);
    const image = await fetchHttpImage(url);

    return await resize(image, max, max);
  } catch (e) {
    return false;
  }
}
