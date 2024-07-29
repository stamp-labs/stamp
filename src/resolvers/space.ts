import axios from 'axios';
import { getUrl, removeFalsyValues, resize } from '../utils';
import { max } from '../constants.json';
import { fetchHttpImage, axiosDefaultParams } from './utils';

const HUB_URL = process.env.HUB_URL || 'https://hub.snapshot.org';

export default async function resolve(key) {
  try {
    const headers = { 'x-api-key': process.env.HUB_API_KEY ?? '' };
    const space = (
      await axios({
        url: `${HUB_URL}/graphql`,
        method: 'post',
        data: {
          query: `query { space(id: "${key}") { avatar } }`
        },
        headers: removeFalsyValues(headers),
        ...axiosDefaultParams
      })
    ).data.data.space;
    if (!space || !space.avatar) return false;
    const url = getUrl(space.avatar);
    const input = await fetchHttpImage(url);
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
