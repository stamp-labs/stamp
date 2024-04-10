import axios from 'axios';
import { getAddress, isAddress } from '@ethersproject/address';
import { resize } from '../utils';
import { max } from '../constants.json';
import { fetchHttpImage } from './utils';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY!!;

export default async function resolve(address) {
  const formattedAddress = getAddress(address);
  if (!isAddress(formattedAddress)) return false;

  try {
    // https://docs.neynar.com/reference/user-bulk-by-address
    const response = await axios.get('https://api.neynar.com/v2/farcaster/user/bulk-by-address', {
      params: {
        addresses: formattedAddress
      },
      headers: {
        accept: 'application/json',
        api_key: NEYNAR_API_KEY
      }
    });
    if (response.status !== 200) return false;

    const avatarUrl: string = response.data[formattedAddress]?.[0]?.pfp_url;

    const input = await fetchHttpImage(avatarUrl);
    return await resize(input, max, max);
  } catch (error) {
    console.error('Error resolving Farcaster avatar:', error);
    return false;
  }
}
