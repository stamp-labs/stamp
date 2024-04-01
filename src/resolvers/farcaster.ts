import axios from 'axios';
import { getAddress, isAddress } from '@ethersproject/address';
import { getUrl, resize } from '../utils';
import { max } from '../constants.json';
import { fetchHttpImage } from './utils';

const FARCASTER_API_URL = 'https://api.neynar.com/v2/farcaster/user/bulk-by-address';

export default async function resolve(address) {
  const formattedAddress = getAddress(address);
  if (!isAddress(formattedAddress)) return false;

  try {
    const { data } = await axios.get(`${FARCASTER_API_URL}?addresses=${address}`, {
      headers: {
        accept: 'application/json',
        api_key: 'NEYNAR_API_DOCS' // Replace with your actual API key
      }
    });

    const user = data[address]?.[0];
    if (!user) return false;

    const avatarUrl = user.pfp_url;
    if (!avatarUrl) return false;

    const url = getUrl(avatarUrl);
    const input = await fetchHttpImage(url);
    return await resize(input, max, max);
  } catch (error) {
    return false;
  }
}
