import axios from 'axios';
import { getAddress } from '@ethersproject/address';
import { resize } from '../utils';
import { max } from '../constants.json';

export default async function resolve(address, network) {
  try {
    let networkStr = 'ethereum';
    if (network === '56') networkStr = 'binance';
    if (network === '250') networkStr = 'fantom';
    if (network === '137') networkStr = 'polygon';
    if (network === '42161') networkStr = 'arbitrum';
    const checksum = getAddress(address);
    const url = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${networkStr}/assets/${checksum}/logo.png`;
    const input = (await axios({ url, responseType: 'arraybuffer' })).data as Buffer;
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
