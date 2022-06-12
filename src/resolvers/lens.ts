import axios from 'axios';
import { getAddress, isAddress } from '@ethersproject/address';
import { getUrl, resize } from '../utils';
import { max } from '../constants.json';

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
      }
    });

    const sourceUrl = getDefaultImage(data.data.profiles.items[0]?.picture);
    if (!sourceUrl) return false;

    const url = getUrl(sourceUrl);
    const input = (await axios({ url, responseType: 'arraybuffer' })).data as Buffer;
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
