import axios from 'axios';
import { getAddress, isAddress } from '@ethersproject/address';
import { getUrl, resize } from '../utils';
import { max } from '../constants.json';
import { fetchHttpImage, axiosDefaultParams } from './utils';

const LENS_API_URL = 'https://api.lens.dev';
const FARCASTER_API_URL = 'https://api.neynar.com/v2/farcaster/user/bulk-by-address';

function getDefaultImage(picture) {
  if (picture?.original) return picture.original.url;
  if (picture?.uri) return picture.uri;

  return null;
}

/**
 * Resolve avatar from Lens API.
 * @param {string} address - Ethereum address.
 * @returns {string|boolean} - Avatar URL if found, otherwise false.
 */
export async function resolveLens(address) {
  const request = isAddress(address)
    ? `{ ownedBy: "${getAddress(address)}", limit: 1 }`
    : `{ handles: ["${address}"], limit: 1 }`;

  try {
    const { data } = await axios({
      url: `${LENS_API_URL}/graphql`,
      method: 'post',
      data: {
        query: `
            query Profile {
              profiles(request: ${request}) {
                items {
                  picture {
                    ... on NftImage {
                      contractAddress
                      tokenId
                      uri
                      chainId
                      verified
                    }
                    ... on MediaSet {
                      original {
                        url
                        mimeType
                      }
                    }
                  }
                }
              }
            }
          `
      },
      ...axiosDefaultParams
    });

    const sourceUrl = getDefaultImage(data.data.profiles.items[0]?.picture);
    if (!sourceUrl) return false;

    const url = getUrl(sourceUrl);
    const input = await fetchHttpImage(url);
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}

/**
 * Resolve avatar from Neynar API (Farcaster).
 * @param {string} address - Ethereum address.
 * @returns {string|boolean} - Avatar URL if found, otherwise false.
 */
export async function resolveFarcaster(address) {
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

/**
 * Resolve avatar using the specified resolver.
 * @param {string} address - Ethereum address.
 * @param {string} resolver - The resolver to use ('lens' or 'farcaster').
 * @returns {string|boolean} - Avatar URL if found, otherwise false.
 */
export async function resolve(address, resolver) {
  if (resolver === 'lens') {
    return await resolveLens(address);
  } else if (resolver === 'farcaster') {
    return await resolveFarcaster(address);
  } else {
    throw new Error('Invalid resolver specified');
  }
}
