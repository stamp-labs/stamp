import axios from 'axios';
import { getUrl, resize } from '../utils';
import { max } from '../constants.json';

const SUBGRAPH_URLS = [
  'https://api.studio.thegraph.com/query/23545/sx-goerli/version/latest',
  'https://api.studio.thegraph.com/query/23545/sx-sepolia/version/latest',
  'https://thegraph.goerli.zkevm.consensys.net/subgraphs/name/snapshot-labs/sx-subgraph'
];

async function getSpaceAvatar(key, url) {
  const data = await axios({
    url,
    method: 'POST',
    data: {
      query: `
        query {
          space(id: "${key}") {
            metadata {
              avatar
            }
          }
        }`
    }
  });

  if (!data.data?.data?.space?.metadata?.avatar) return Promise.reject(false);

  return data.data.data.space.metadata?.avatar;
}

export default async function resolve(key) {
  try {
    const avatar = await Promise.any(SUBGRAPH_URLS.map(url => getSpaceAvatar(key, url)));

    const url = getUrl(avatar);
    const input = (await axios({ url, responseType: 'arraybuffer' })).data as Buffer;

    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
