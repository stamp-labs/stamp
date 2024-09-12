import { getUrl, graphQlCall, resize } from '../utils';
import { max } from '../constants.json';
import { fetchHttpImage } from './utils';

const HUB_URL = process.env.HUB_URL ?? 'https://hub.snapshot.org';

function createPropertyResolver(entity: 'user' | 'space', property: 'avatar' | 'cover') {
  return async (address: string) => {
    try {
      const {
        data: {
          data: { entry }
        }
      } = await graphQlCall(
        `${HUB_URL}/graphql`,
        `query { entry: ${entity}(id: "${address}") { ${property} } }`,
        {
          headers: { 'x-api-key': process.env.HUB_API_KEY }
        }
      );

      if (!entry?.[property]) return false;

      const url = getUrl(entry[property]);
      const input = await fetchHttpImage(url);

      if (property === 'cover') return input;

      return await resize(input, max, max);
    } catch (e) {
      return false;
    }
  };
}

export const resolveUserAvatar = createPropertyResolver('user', 'avatar');
export const resolveUserCover = createPropertyResolver('user', 'cover');
export const resolveSpaceAvatar = createPropertyResolver('space', 'avatar');
export const resolveSpaceCover = createPropertyResolver('space', 'cover');
