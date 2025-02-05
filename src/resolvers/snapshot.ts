import { getAddress } from '@ethersproject/address';
import { getUrl, graphQlCall, resize } from '../utils';
import { max, offchainNetworks, defaultOffchainNetwork } from '../constants.json';
import { fetchHttpImage } from './utils';
import { isStarknetAddress } from '../addressResolvers/utils';

const API_URLS = {
  s: `${process.env.HUB_URL ?? 'https://hub.snapshot.org'}/graphql`,
  's-tn': `${process.env.HUB_URL_TN ?? 'https://testnet.hub.snapshot.org'}/graphql`,
  eth:
    'https://subgrapher.snapshot.org/subgraph/arbitrum/GerdwbJnTbEz45K7S3D2MLET6VFiY8VqwrqWZg52x2vx',
  sep:
    'https://subgrapher.snapshot.org/subgraph/arbitrum/3682UpSJVQ89v6BMSzxDSiQWZKa3Hbn6RKucpT8jZ5nT',
  matic:
    'https://subgrapher.snapshot.org/subgraph/arbitrum/5DzKWssJUVKA1imXGyExrycUjdz7t5t7gzTsE9GQhBUn',
  arb1:
    'https://subgrapher.snapshot.org/subgraph/arbitrum/4QovVxoK3TBLwZKPD1YPHHko5Zz87HvdjpEDBvitCWcH',
  oeth:
    'https://subgrapher.snapshot.org/subgraph/arbitrum/4zXNNp5B34DUNACzonVsHivNJRUHnFBqhvBPYJVaNyks',
  base:
    'https://subgrapher.snapshot.org/subgraph/arbitrum/BmcnmDYyCcN7NmQuWXyx3p1xLEiq3sYmvFct8uvBQfum',
  sn: 'https://api.snapshot.box',
  'sn-sep': 'https://testnet-api.snapshot.box'
};

type Entity = 'user' | 'space';
type Property = 'avatar' | 'cover' | 'logo';

const QUERIES = {
  avatar: {
    query: 'avatar',
    extract: (data: any) => data?.avatar
  },
  cover: {
    query: 'cover',
    extract: (data: any) => data?.cover
  },
  logo: {
    query: 'skinSettings { logo }',
    extract: (data: any) => data?.skinSettings?.logo
  }
};

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
    `query { entry: ${entity}(id: "${id}") { ${QUERIES[property].query} } }`,
    {
      headers: { 'x-api-key': process.env.HUB_API_KEY }
    }
  );

  return QUERIES[property].extract(entry);
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
        value = await getOffchainProperty(
          offchainNetworks.includes(networkId) ? networkId : defaultOffchainNetwork,
          address,
          entity,
          property
        );
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
export const resolveSpaceLogo = createPropertyResolver('space', 'logo');
