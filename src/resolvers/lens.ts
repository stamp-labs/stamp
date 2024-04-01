import axios from 'axios';
import { getAddress, isAddress } from '@ethersproject/address';
import { getUrl, resize } from '../utils';
import { max } from '../constants.json';
import { fetchHttpImage, axiosDefaultParams } from './utils';

const API_URL = 'https://api.lens.dev';

function getDefaultImage(picture) {
  if (picture?.original) return picture.original.url;
  if (picture?.uri) return picture.uri;

  return null;
}

export default async function resolve(address) {
  const request = isAddress(address)
    ? `{ ownedBy: "${getAddress(address)}", limit: 1 }`
    : `{ handles: ["${address}"], limit: 1 }`;

  try {
    const { data } = await axios({
      url: `${API_URL}/graphql`,
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
