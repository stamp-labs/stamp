import axios from 'axios';
import { capture } from '@snapshot-labs/snapshot-sentry';
import { Address, Handle } from './utils';

const API_URL = 'https://api.lens.dev';

export async function lookupAddresses(addresses: Address[]): Promise<Record<Address, Handle>> {
  try {
    const {
      data: {
        data: {
          profiles: { items }
        }
      }
    } = await axios({
      url: `${API_URL}/graphql`,
      method: 'post',
      data: {
        query: `
          query Profile {
            profiles(request: { ownedBy: ["${addresses.join('","')}"] }) {
              items {
                handle
                ownedBy
              }
            }
          }
        `
      }
    });

    return Object.fromEntries(items.map(i => [i.ownedBy, i.handle])) || {};
  } catch (e) {
    capture(e);
    return {};
  }
}

export async function resolveName(handle: string): Promise<string | null> {
  try {
    const response = await axios({
      url: API_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        query: `
          query Profiles {
            profiles(request: { handles: ["${handle}"], limit: 1 }) {
              items {
                ownedBy
              }
            }
          }
        `
      }
    });

    const result = await response.json();
    return result.data?.profiles?.items?.[0]?.ownedBy;
  } catch (e) {
    capture(e);
  }

  return null;
}
