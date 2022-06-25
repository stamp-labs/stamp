import axios from 'axios';
import { getAddress } from '@ethersproject/address';
import { resize, chainIdToName } from '../utils';
import { max } from '../constants.json';

const ETH = [
  '0x0000000000000000000000000000000000000000',
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
];

export default async function resolve(address, chainId) {
  try {
    const networkName = chainIdToName(chainId) || 'ethereum';
    const checksum = getAddress(address);

    let url = `https://storage.googleapis.com/zapper-fi-assets/tokens/${networkName}/${checksum.toLocaleLowerCase()}.png`;
    if (ETH.includes(checksum)) url = 'https://static.cdnlogo.com/logos/e/81/ethereum-eth.svg';

    const input = (await axios({ url, responseType: 'arraybuffer' })).data as Buffer;
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
