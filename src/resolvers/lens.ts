import axios from 'axios';
import { getAddress } from '@ethersproject/address';
import { getUrl, resize } from '../utils';
import { max } from '../constants.json';

const API_URL = 'https://api.lens.dev';

export default async function resolve(address) {
  try {
    const { data } = await axios({
      url: `${API_URL}/graphql`,
      method: 'post',
      data: {
        query: `
            query DefaultProfile {
              defaultProfile(request: { ethereumAddress: "${getAddress(address)}"}) {
                picture {
                  ... on NftImage {
                    contractAddress
                    tokenId
                    uri
                    chainId
                    verified
                  }
                }
              }
            }
          `
      }
    });

    const { uri } = data.data.defaultProfile?.picture || {};
    if (!uri) return false;

    const url = getUrl(uri);
    const input = (await axios({ url, responseType: 'arraybuffer' })).data as Buffer;
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
