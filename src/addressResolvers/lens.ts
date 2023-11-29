import { capture } from '@snapshot-labs/snapshot-sentry';
import { graphQlCall, Address, Handle, FetchError } from './utils';

export const NAME = 'Lens';
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

function normalizeHandles(handles: Handle[]): Handle[] {
  return handles.map(h => (/^[a-z0-9-_]{5,31}\.lens$/.test(h) ? h : ''));
}

export async function lookupAddresses(addresses: Address[]): Promise<Record<Address, Handle>> {
  try {
    const items = await apiCall('ownedBy', addresses);

    return Object.fromEntries(items.map(i => [i.ownedBy, i.handle])) || {};
  } catch (e) {
    capture(e, { input: { addresses } });
    throw new FetchError();
  }
}

export async function resolveNames(handles: Handle[]): Promise<Record<Handle, Address>> {
  const normalizedHandles = normalizeHandles(handles).filter(h => h);

  if (normalizedHandles.length === 0) return {};

  try {
    const items = await apiCall('handles', normalizedHandles);

    return Object.fromEntries(items.map(i => [i.handle, i.ownedBy])) || {};
  } catch (e) {
    capture(e, { input: { handles: normalizedHandles } });
    throw new FetchError();
  }
}
