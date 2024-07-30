import { getUrl, graphQlCall, resize } from '../utils';
import { max } from '../constants.json';
import { fetchHttpImage } from './utils';

const HUB_URL = process.env.HUB_URL ?? 'https://hub.snapshot.org';

function createPropertyResolver(property: 'avatar' | 'cover') {
  return async (address: string) => {
    try {
      const {
        data: {
          data: { user }
        }
      } = await graphQlCall(
        `${HUB_URL}/graphql`,
        `query { user(id: "${address}") { ${property} } }`
      );

      if (!user?.[property]) return false;

      const url = getUrl(user[property]);
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
