import { getAddress } from '@ethersproject/address';
import { resize } from '../utils';
import { max } from '../constants.json';
import { fetchHttpImage } from './utils';

const API_KEY = process.env.COINGECKO_API_KEY;

const COINGECKO_ASSET_PLATFORMS = {
  1: 'ethereum',
  10: 'optimistic-ethereum',
  137: 'polygon-pos',
  8453: 'base',
  42161: 'arbitrum-one'
};

export default async function resolve(address, chainId) {
  try {
    const assetPlatformId = COINGECKO_ASSET_PLATFORMS[chainId];
    const checksum = getAddress(address);
    const url = `https://pro-api.coingecko.com/api/v3/coins/${assetPlatformId}/contract/${checksum}?x_cg_pro_api_key=${API_KEY}`;

    const data = await fetch(url).then(res => res.json());
    const input = await fetchHttpImage(data?.image?.large);
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
