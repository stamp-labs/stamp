import axios from 'axios';
import { getAddress } from '@ethersproject/address';
import { getUrl, resize } from '../utils';
import { max } from '../constants.json';
import { fetchHttpImage, axiosDefaultParams } from './utils';
import { isStarknetAddress } from '../addressResolvers/utils';

const SUBGRAPH_URLS = [
  'https://api.studio.thegraph.com/query/23545/sx/version/latest',
  'https://api.studio.thegraph.com/query/23545/sx-sepolia/version/latest',
  'https://api.studio.thegraph.com/query/23545/sx-polygon/version/latest',
  'https://api.studio.thegraph.com/query/23545/sx-arbitrum/version/latest',
  'https://api.studio.thegraph.com/query/23545/sx-optimism/version/latest',
  'https://api-1.snapshotx.xyz',
  'https://testnet-api-1.snapshotx.xyz'
];

async function getSpaceProperty(key: string, url: string, property: 'avatar' | 'cover') {
  const id = [key];
  if (!isStarknetAddress(key)) {
    id.push(getAddress(key));
  }

  const data = await axios({
    url,
    method: 'POST',
    data: {
      query: `
        query {
          spaces(where: { id_in: [${id.map(item => `"${item}"`).join(', ')}] }) {
            metadata {
              ${property}
            }
          }
        }`
    },
    ...axiosDefaultParams
  });

  const result = data.data?.data?.spaces
    ?.map(space => space.metadata?.[property])
    .filter(Boolean)[0];

  return result || Promise.reject(false);
}

function createPropertyResolver(property: 'avatar' | 'cover') {
  return async key => {
    try {
      const value = await Promise.any(
        SUBGRAPH_URLS.map(url => getSpaceProperty(key, url, property))
      );

      const url = getUrl(value);
      const input = await fetchHttpImage(url);

      if (property === 'cover') return input;
      return await resize(input, max, max);
    } catch (e) {
      return false;
    }
  };
}

export const resolveAvatar = createPropertyResolver('avatar');
export const resolveCover = createPropertyResolver('cover');
