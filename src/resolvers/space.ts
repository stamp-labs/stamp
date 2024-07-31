import { getUrl, graphQlCall, resize } from '../utils';
import { max } from '../constants.json';
import { fetchHttpImage } from './utils';

const HUB_URL = process.env.HUB_URL || 'https://hub.snapshot.org';

export default async function resolve(key) {
  try {
    const {
      data: {
        data: { space }
      }
    } = await graphQlCall(`${HUB_URL}/graphql`, `query { space(id: "${key}") { avatar } }`);

    if (!space || !space.avatar) return false;

    const url = getUrl(space.avatar);
    const input = await fetchHttpImage(url);
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
