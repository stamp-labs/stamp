import axios from 'axios';
import { getUrl, resize } from '../utils';
import { max } from '../constants.json';

// TODO: deploy new cover indexing to all networks
const SUBGRAPH_URLS = [
  'https://api.studio.thegraph.com/query/41343/sekhmet-sx-goerli/version/latest'
];

// const SUBGRAPH_URLS = [
//   'https://api.studio.thegraph.com/query/23545/sx-goerli/version/latest',
//   'https://api.studio.thegraph.com/query/23545/sx-sepolia/version/latest',
//   'https://thegraph.goerli.zkevm.consensys.net/subgraphs/name/snapshot-labs/sx-subgraph'
// ];

async function getSpaceProperty(key: string, url: string, property: 'avatar' | 'cover') {
  const data = await axios({
    url,
    method: 'POST',
    data: {
      query: `
        query {
          space(id: "${key}") {
            metadata {
              ${property}
            }
          }
        }`
    }
  });

  if (!data.data?.data?.space?.metadata?.[property]) return Promise.reject(false);

  return data.data.data.space.metadata?.[property];
}

function createPropertyResolver(property: 'avatar' | 'cover') {
  return async key => {
    try {
      const value = await Promise.any(
        SUBGRAPH_URLS.map(url => getSpaceProperty(key, url, property))
      );

      const url = getUrl(value);
      const input = (await axios({ url, responseType: 'arraybuffer' })).data as Buffer;

      if (property === 'cover') return input;
      return await resize(input, max, max);
    } catch (e) {
      return false;
    }
  };
}

export const resolveAvatar = createPropertyResolver('avatar');
export const resolveCover = createPropertyResolver('cover');
