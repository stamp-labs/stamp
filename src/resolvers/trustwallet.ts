import axios from 'axios';
import { getAddress } from '@ethersproject/address';
import { resize } from '../utils';
import { max } from '../constants.json';

const ETH = [
  '0x0000000000000000000000000000000000000000',
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
];

export default async function resolve(address, network) {
  try {
    let networkStr = 'ethereum';
    if (network === '56') networkStr = 'binance';
    if (network === '250') networkStr = 'fantom';
    if (network === '137') networkStr = 'polygon';
    if (network === '42161') networkStr = 'arbitrum';
    const checksum = getAddress(address);
    let url = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${networkStr}/assets/${checksum}/logo.png`;
    if (ETH.includes(checksum)) url = 'https://static.cdnlogo.com/logos/e/81/ethereum-eth.svg';
    const input = (await axios({ url, responseType: 'arraybuffer' })).data as Buffer;
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
