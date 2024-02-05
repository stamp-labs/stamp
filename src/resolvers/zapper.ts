import { getAddress } from '@ethersproject/address';
import { resize, chainIdToName, getBaseAssetIconUrl } from '../utils';
import { max } from '../constants.json';
import { fetchHttpImage } from './utils';

const ETH = [
  '0x0000000000000000000000000000000000000000',
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
];

export default async function resolve(address, chainId) {
  try {
    const networkName = chainIdToName(chainId) || 'ethereum';
    const checksum = getAddress(address);

    let url = `https://storage.googleapis.com/zapper-fi-assets/tokens/${networkName}/${checksum.toLocaleLowerCase()}.png`;
    if (ETH.includes(checksum)) url = getBaseAssetIconUrl(chainId);

    const input = await fetchHttpImage(url);
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
