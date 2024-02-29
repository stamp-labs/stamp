import { capture } from '@snapshot-labs/snapshot-sentry';
import { graphQlCall, Address, Handle, FetchError, isSilencedError, isEvmAddress } from './utils';

export const NAME = 'Lens';
const API_URL = 'https://api-v2.lens.dev/graphql';

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
      profiles(request: { where: { ${filterName}: ["${filters.join('","')}"] } }) {
        items {
          handle {
            ownedBy
            localName
          }
        }
      }
    }`
  );

  return items;
}

function normalizeAddresses(addresses: Address[]): Address[] {
  return addresses.filter(isEvmAddress);
}

function normalizeHandles(handles: Handle[]): Handle[] {
  return handles
    .map(h => (/^[a-z0-9-_]{5,31}\.lens$/.test(h) ? `lens/${h.replace(/\.lens$/, '')}` : ''))
    .filter(h => h);
}

export async function lookupAddresses(addresses: Address[]): Promise<Record<Address, Handle>> {
  const normalizedAddresses = normalizeAddresses(addresses);

  if (normalizedAddresses.length === 0) return {};

  try {
    const items = await apiCall('ownedBy', normalizedAddresses);

    return (
      Object.fromEntries(
        items.filter(i => i.handle).map(i => [i.handle.ownedBy, `${i.handle.localName}.lens`])
      ) || {}
    );
  } catch (e) {
    if (!isSilencedError(e)) {
      capture(e, { input: { addresses: normalizedAddresses } });
    }

    throw new FetchError();
  }
}

export async function resolveNames(handles: Handle[]): Promise<Record<Handle, Address>> {
  const normalizedHandles = normalizeHandles(handles);

  if (normalizedHandles.length === 0) return {};

  try {
    const items = await apiCall('handles', normalizedHandles);

    return (
      Object.fromEntries(items.map(i => [`${i.handle.localName}.lens`, i.handle.ownedBy])) || {}
    );
  } catch (e) {
    if (!isSilencedError(e)) {
      capture(e, { input: { handles: normalizedHandles } });
    }
    throw new FetchError();
  }
}
