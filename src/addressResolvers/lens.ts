import { capture } from '@snapshot-labs/snapshot-sentry';
import { graphQlCall, Address, Handle } from './utils';

const API_URL = 'https://api.lens.dev/graphql';

async function apiCall(filterName: string, filters: string[]) {
  const {
    data: {
      data: {
        profiles: { items }
      }
    }
  } = await graphQlCall(
    API_URL,
    `query Profile {
      profiles(request: { ${filterName}: ["${filters.join('","')}"] }) {
        items {
          handle
          ownedBy
        }
      }
    }`
  );

  return items;
}

export async function lookupAddresses(addresses: Address[]): Promise<Record<Address, Handle>> {
  try {
    const items = await apiCall('ownedBy', addresses);

    return Object.fromEntries(items.map(i => [i.ownedBy, i.handle])) || {};
  } catch (e) {
    capture(e, { addresses });
    return {};
  }
}

export async function resolveNames(handles: Handle[]): Promise<Record<Handle, Address>> {
  try {
    const items = await apiCall(
      'handles',
      handles.filter(handle => handle.endsWith('.lens'))
    );

    return Object.fromEntries(items.map(i => [i.handle, i.ownedBy])) || {};
  } catch (e) {
    capture(e, { handles });
    return {};
  }
}
