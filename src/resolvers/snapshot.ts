import { getUrl, graphQlCall, resize } from '../utils';
import { max, offchainNetworks, defaultOffchainNetwork } from '../constants.json';
import { fetchHttpImage } from './utils';

const HUB_URLS = {
  s: process.env.HUB_URL ?? 'https://hub.snapshot.org',
  's-tn': process.env.HUB_URL_TN ?? 'https://testnet.hub.snapshot.org'
};

async function getOffchainProperty(
  network: string,
  id: string,
  entity: 'user' | 'space',
  property: 'avatar' | 'cover'
) {
  try {
    const {
      data: {
        data: { entry }
      }
    } = await graphQlCall(
      `${HUB_URLS[network]}/graphql`,
      `query { entry: ${entity}(id: "${id}") { ${property} } }`,
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
}

function createPropertyResolver(entity: 'user' | 'space', property: 'avatar' | 'cover') {
  return async (address: string, network = defaultOffchainNetwork) => {
    if (offchainNetworks.includes(network)) {
      return getOffchainProperty(network, address, entity, property);
    }
  };
}

export const resolveUserAvatar = createPropertyResolver('user', 'avatar');
export const resolveUserCover = createPropertyResolver('user', 'cover');
export const resolveSpaceAvatar = createPropertyResolver('space', 'avatar');
export const resolveSpaceCover = createPropertyResolver('space', 'cover');
