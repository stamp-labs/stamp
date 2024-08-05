import { getAddress } from '@ethersproject/address';
import { resize, chainIdToName } from '../utils';
import { max } from '../constants.json';
import { fetchHttpImage } from './utils';
import tokenlists from '../helpers/tokenlists';

function searchTokenlists(address: string, chainId: string) {
  const checksum = getAddress(address);
  const networkName = chainIdToName(chainId) || 'ethereum';

  const url = tokenlists[networkName]?.find(list =>
    list.tokens.find(token => getAddress(token.address) === checksum)
  )?.logoURI;

  return url;
}

export default async function resolve(address: string, chainId: string) {
  const url = searchTokenlists(address, chainId);
  if (!url) return false;

  const image = await fetchHttpImage(url);
  if (!image) return false;

  return await resize(image, max, max);
}
