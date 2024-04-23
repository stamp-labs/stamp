import fetch from 'node-fetch';
import { getAddress, isAddress } from '@ethersproject/address';
import { Address } from '../addressResolvers/utils';
import { resize } from '../utils';
import { max } from '../constants.json';
import { fetchHttpImage } from './utils';

const NEYNAR_API_URL = 'https://api.neynar.com/v2/farcaster/user/bulk-by-address';
const API_KEY: string = process.env.NEYNAR_API_KEY ?? '';

interface UserDetails {
  pfp_url?: string;
}

interface ApiResponse {
  [key: string]: Array<UserDetails>;
}

function withCache(url: string): string {
  return url.includes('imgur.com')
    ? `https://wrpcd.net/cdn-cgi/image/fit=contain,f=auto,w=${max}/${encodeURIComponent(url)}`
    : url;
}

const normalizeAddress = (address: Address): Address | null => {
  try {
    return isAddress(address) ? getAddress(address) : null;
  } catch (error) {
    console.error('Invalid Ethereum address:', address);
    return null;
  }
};

const logError = (message: string, error?: any) => console.error(message, error);

async function fetchUserDetailsByAddress(normalizedAddress: string): Promise<UserDetails | null> {
  try {
    const response = await fetch(`${NEYNAR_API_URL}?addresses=${normalizedAddress}`, {
      headers: { Accept: 'application/json', api_key: API_KEY }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }

    const data: ApiResponse = await response.json();

    const userDetails = data[normalizedAddress.toLowerCase()]?.[0];
    if (!userDetails) {
      throw new Error('User details not found for address:', userDetails);
    }

    return userDetails;
  } catch (error) {
    logError('Error fetching user details:', error);
    return null;
  }
}

export default async function resolve(address: string): Promise<Buffer | false> {
  const normalizedAddress = normalizeAddress(address);
  if (!normalizedAddress) {
    logError('Failed to normalize address:', address);
    return false;
  }

  const userDetails = await fetchUserDetailsByAddress(normalizedAddress);

  if (!userDetails || !userDetails.pfp_url) {
    logError('No user or profile picture found for address:', address);
    return false;
  }

  try {
    const imageUrl = withCache(userDetails.pfp_url);
    const input = await fetchHttpImage(imageUrl);
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
