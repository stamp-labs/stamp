import axios from 'axios';
import { capture } from '@snapshot-labs/snapshot-sentry';
import { Address, Handle } from './utils';

const API_URL = 'https://api.lens.dev';

async function apiCall(query: string) {
  const {
    data: {
      data: {
        profiles: { items }
      }
    }
  } = await axios({
    url: API_URL,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      query
    }
  });

  return items;
}

export async function lookupAddresses(addresses: Address[]): Promise<Record<Address, Handle>> {
  try {
    const items = await apiCall(`
          query Profile {
            profiles(request: { ownedBy: ["${addresses.join('","')}"] }) {
              items {
                handle
                ownedBy
              }
            }
          }
        `);

    return Object.fromEntries(items.map(i => [i.ownedBy, i.handle])) || {};
  } catch (e) {
    capture(e);
    return {};
  }
}

export async function resolveName(handle: string): Promise<string | undefined> {
  try {
    const items = await apiCall(`
          query Profiles {
            profiles(request: { handles: ["${handle}"], limit: 1 }) {
              items {
                ownedBy
              }
            }
          }
        `);

    return items?.[0]?.ownedBy;
  } catch (e) {
    capture(e);
  }
}
