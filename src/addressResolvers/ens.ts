import { getAddress } from '@ethersproject/address';
import { capture } from '@snapshot-labs/snapshot-sentry';
import { ens_normalize } from '@adraffy/ens-normalize';
import { graphQlCall, Address, Handle, FetchError } from './utils';

export const NAME = 'Ens';
const API_URL = 'https://api.thegraph.com/subgraphs/name/ensdomains/ens';

async function apiCall(filterName: string, filters: string[]) {
  const {
    data: {
      data: { domains: items }
    }
  } = await graphQlCall(
    API_URL,
    `query Domains {
      domains(where: { ${filterName}: ["${filters.join('","')}"]}) {
        name
        resolvedAddress {
          id
        }
      }
    }`
  );

  return items;
}

function normalizeHandles(names: string[]) {
  return names.map(name => {
    try {
      return ens_normalize(name) === name ? name : '';
    } catch (e) {
      return '';
    }
  });
}

export async function lookupAddresses(addresses: Address[]): Promise<Record<Address, Handle>> {
  try {
    const items = await apiCall(
      'resolvedAddress_in',
      addresses.map(a => a.toLowerCase())
    );

    return Object.fromEntries(
      items.map(item => [
        item.resolvedAddress ? getAddress(item.resolvedAddress.id) : '',
        item.name
      ])
    );
  } catch (e) {
    capture(e, { input: { addresses } });
    throw new FetchError();
  }
}

export async function resolveNames(handles: Handle[]): Promise<Record<Handle, Address>> {
  const normalizedHandles = normalizeHandles(handles).filter(h => h);

  if (normalizedHandles.length === 0) return {};

  try {
    const items = await apiCall('name_in', normalizedHandles);

    return Object.fromEntries(
      items.map(item => [
        item.name,
        item.resolvedAddress ? getAddress(item.resolvedAddress.id) : ''
      ])
    );
  } catch (e) {
    capture(e, { input: { handles } });
    throw new FetchError();
  }
}
