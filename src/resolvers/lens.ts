import { getAddress, isAddress } from '@ethersproject/address';
import { graphQlCall, resize } from '../utils';
import { max } from '../constants.json';
import { fetchHttpImage } from './utils';

const API_URL = 'https://api-v2.lens.dev';
const LENS_IPFS_GATEWAY = 'https://gw.ipfs-lens.dev/ipfs/';
const LENS_EXTENSION = '.lens';

function normalizeImageUrl(url: string) {
  if (!url) return false;

  // Lens IPFS gateway is returning 403 when accessed directly
  if (url.startsWith(LENS_IPFS_GATEWAY)) {
    return `https://${process.env.IPFS_GATEWAY || 'cloudflare-ipfs.com'}/ipfs/${
      url.split(LENS_IPFS_GATEWAY)[1]
    }`;
  }
}

export default async function resolve(domainOrAddress: string) {
  let request: string;

  if (isAddress(domainOrAddress)) {
    request = `{ ownedBy: ["${getAddress(domainOrAddress)}"] }`;
  } else if (domainOrAddress.endsWith(LENS_EXTENSION)) {
    request = `{ handles: ["lens/${domainOrAddress.split(LENS_EXTENSION)[0]}"] }`;
  } else {
    return false;
  }

  try {
    const {
      data: {
        data: {
          profiles: { items }
        }
      }
    } = await graphQlCall(
      `${API_URL}/graphql`,
      `query Profile {
        profiles(request: { where: ${request}, limit: Ten }) {
          items {
            metadata {
              picture {
                ... on ImageSet {
                  raw {
                    uri
                  }
                }
              }
            }
          }
        }
      }`
    );

    const img_url = normalizeImageUrl(items?.[0]?.metadata?.picture?.raw?.uri);
    if (!img_url) return false;

    const input = await fetchHttpImage(img_url);
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
