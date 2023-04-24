import axios from 'axios';
import { getUrl, resize } from '../utils';
import { max } from '../constants.json';

const HUB_URL = 'https://api.thegraph.com/subgraphs/name/snapshot-labs/sx-goerli';

export default async function resolve(key) {
  try {
    const space = (
      await axios({
        url: HUB_URL,
        method: 'post',
        data: {
          query: `query { space(id: "${key}") { avatar } }`
        }
      })
    ).data.data.space;
    if (!space || !space.avatar) return false;
    const url = getUrl(space.avatar);
    const input = (await axios({ url, responseType: 'arraybuffer' })).data as Buffer;
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
