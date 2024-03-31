import axios from 'axios';
import { getAddress, isAddress } from '@ethersproject/address';
import { getUrl, resize } from '../utils';
import { max } from '../constants.json';
import { fetchHttpImage, axiosDefaultParams } from './utils';

const NEYNAR_API_URL = 'https://api.neynar.com/v2/farcaster/user/bulk-by-address';
const API_KEY = 'NEYNAR_API_DOCS';

function normalizeAddress(address) {
  try {
    return isAddress(address) ? getAddress(address) : null;
  } catch (error) {
    console.error('Invalid Ethereum address:', address);
    return null;
  }
}

async function fetchUserDetailsByAddress(normalizedAddress) {
  try {
    const response = await axios.get(`${NEYNAR_API_URL}?addresses=${normalizedAddress}`, {
      headers: { Accept: 'application/json', api_key: API_KEY }
    });

    const user = response.data[normalizedAddress.toLowerCase()]?.[0];
    return user || null;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
}

export default async function resolve(address) {
  const normalizedAddress = normalizeAddress(address);
  if (!normalizedAddress) {
    console.error('Failed to normalize address:', address);
    return false;
  }

  const userDetails = await fetchUserDetailsByAddress(normalizedAddress);
  if (!userDetails || !userDetails.pfp_url) {
    console.error('No user or profile picture found for address:', address);
    return false;
  }

  try {
    const imageUrl = new URL(userDetails.pfp_url);
    const imageBlob = await fetchHttpImage(imageUrl.toString());
    const resizedImage = await resize(imageBlob, max, max);
    return resizedImage;
  } catch (e) {
    return false;
  }
}
