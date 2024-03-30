import axios from 'axios';
import { getAddress, isAddress } from '@ethersproject/address';
import { resize } from '../utils';
import { max } from '../constants.json';
import { fetchHttpImage, axiosDefaultParams } from './utils';

const API_URL = 'https://searchcaster.xyz/api/profiles';

export default async function resolve(address) {
  const formattedAddress = getAddress(address);
  if (!isAddress(formattedAddress)) return false;

  try {
    const response = await axios.get(
      `${API_URL}?connected_address=${formattedAddress}`,
      axiosDefaultParams
    );
    const profiles = response.data;

    if (profiles.length === 0) return false;

    const avatarUrl = profiles[0]?.body?.avatarUrl;
    if (!avatarUrl) return false;

    const input = await fetchHttpImage(avatarUrl);
    return await resize(input, max, max);
  } catch (error) {
    console.error('Error resolving Farcaster avatar:', error);
    return false;
  }
}