import { getAddress } from '@ethersproject/address';
import { getUrl, graphQlCall, resize } from '../utils';
import { max, offchainNetworks, defaultOffchainNetwork } from '../constants.json';
import { fetchHttpImage } from './utils';
import { isStarknetAddress } from '../addressResolvers/utils';

const API_URLS = {
  s: `${process.env.HUB_URL ?? 'https://hub.snapshot.org'}/graphql`,
  's-tn': `${process.env.HUB_URL_TN ?? 'https://testnet.hub.snapshot.org'}/graphql`,
  eth: 'https://api.studio.thegraph.com/query/23545/sx/version/latest',
  sep: 'https://api.studio.thegraph.com/query/23545/sx-sepolia/version/latest',
  matic: 'https://api.studio.thegraph.com/query/23545/sx-polygon/version/latest',
  arb1: 'https://api.studio.thegraph.com/query/23545/sx-arbitrum/version/latest',
  oeth: 'https://api.studio.thegraph.com/query/23545/sx-optimism/version/latest',
  sn: 'https://api.snapshot.box',
  'sn-sep': 'https://testnet-api.snapshot.box'
};

type Entity = 'user' | 'space';
type Property = 'avatar' | 'cover';

async function getOffchainProperty(
  networkId: string,
  id: string,
  entity: Entity,
  property: Property
) {
  const {
    data: {
      data: { entry }
    }
  } = await graphQlCall(
    API_URLS[networkId],
    `query { entry: ${entity}(id: "${id}") { ${property} } }`,
    {
      headers: { 'x-api-key': process.env.HUB_API_KEY }
    }
  );

  return entry?.[property];
}

async function getOnchainProperty(
  networkId: string,
  id: string,
  entity: Entity,
  property: Property
) {
  const ids = [id];
  if (!isStarknetAddress(id)) {
    ids.push(getAddress(id));
  }

  const {
    data: {
      data: { spaces }
    }
  } = await graphQlCall(
    API_URLS[networkId],
    `query {
      spaces(where: { id_in: [${ids.map(item => `"${item}"`).join(', ')}] }) {
        metadata {
          ${property}
        }
      }
    }`
  );

  return spaces?.map(space => space.metadata?.[property]).filter(Boolean)[0];
}

function createPropertyResolver(entity: Entity, property: Property) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async (address: string, chainId = 1, networkId = defaultOffchainNetwork) => {
    let value = null;

    if (!Object.keys(API_URLS).includes(networkId)) return false;

    try {
      if (offchainNetworks.includes(networkId) || entity === 'user') {
        value = await getOffchainProperty(networkId, address, entity, property);
      } else {
        value = await getOnchainProperty(networkId, address, entity, property);
      }

      if (!value) return false;

      const url = getUrl(value);
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
