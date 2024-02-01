import { capture } from '@snapshot-labs/snapshot-sentry';
import {
  Address,
  Handle,
  withoutEmptyValues,
  isSilencedError,
  FetchError,
  isNonEvmAddress
} from './utils';
import axios from 'axios';

export const NAME = 'Starknet';
const BASE_URL = 'https://api.starknet.id';

type RESOLVE_TYPE = 'addr_to_domain' | 'domain_to_addr';

async function apiCall(
  resolve_type: RESOLVE_TYPE,
  needles: string[]
): Promise<Record<string, string>> {
  const requests = needles.map(needle =>
    axios.get(
      `${BASE_URL}/${resolve_type}?${
        resolve_type === 'addr_to_domain' ? 'addr' : 'domain'
      }=${needle}`,
      { timeout: 5e3 }
    )
  );
  const responses = await Promise.allSettled(requests);

  return withoutEmptyValues(
    needles.map((needle, i) => {
      const response = responses[i];
      let value: string | undefined;

      if (response.status === 'fulfilled') {
        value = response.value.data[resolve_type === 'addr_to_domain' ? 'domain' : 'addr'];
      }

      return [needle, value];
    })
  );
}

function normalizeAddresses(addresses: Address[]): Address[] {
  return addresses.filter(isNonEvmAddress);
}

function normalizeHandles(handles: Handle[]): Handle[] {
  return handles.filter(h => h.endsWith('.stark'));
}

export async function lookupAddresses(addresses: Address[]): Promise<Record<Address, Handle>> {
  try {
    const normalizedAddresses = normalizeAddresses(addresses);

    if (normalizedAddresses.length === 0) return {};

    return await apiCall('addr_to_domain', normalizedAddresses);
  } catch (e) {
    if (!isSilencedError(e)) {
      capture(e, { input: { addresses } });
    }
    throw new FetchError();
  }
}

export async function resolveNames(handles: Handle[]): Promise<Record<Handle, Address>> {
  try {
    const normalizedHandles = normalizeHandles(handles);

    if (normalizedHandles.length === 0) return {};

    return await apiCall('domain_to_addr', normalizedHandles);
  } catch (e) {
    if (!isSilencedError(e)) {
      capture(e, { input: { handles } });
    }
    throw new FetchError();
  }
}
