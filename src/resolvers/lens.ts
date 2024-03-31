import axios from 'axios';
import { getAddress, isAddress } from '@ethersproject/address';
import { getUrl, resize } from '../utils';
import { max } from '../constants.json';
import { fetchHttpImage, axiosDefaultParams } from './utils';

const LENS_API_URL = 'https://api.lens.dev';
const FARCASTER_API_URL = 'https://searchcaster.xyz/api/profiles';

function getDefaultImage(picture) {
  if (picture?.original) return picture.original.url;
  if (picture?.uri) return picture.uri;

  return null;
}

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

export async function resolveFarcaster(address) {
  try {
    const { data } = await axios.get(
      `${FARCASTER_API_URL}?connected_address=${address}`,
      axiosDefaultParams
    );

    const profile = data[0];
    if (!profile) return false;

    const avatarUrl = profile.body.avatarUrl;
    if (!avatarUrl) return false;

    const url = getUrl(avatarUrl);
    const input = await fetchHttpImage(url);
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
