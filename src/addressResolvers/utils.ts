import axios from 'axios';
import snapshot from '@snapshot-labs/snapshot.js';
import { getAddress } from '@ethersproject/address';

export type Address = string;
export type Handle = string;

const broviderUrl = process.env.BROVIDER_URL || 'https://rpc.brovider.xyz';

export class FetchError extends Error {}

export function provider(network: string) {
  return snapshot.utils.getProvider(network, { broviderUrl });
}

export function withoutEmptyValues(obj: Record<string, any>) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value));
}

export function graphQlCall(url, query: string) {
  return axios({
    url: url,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 5e3,
    data: {
      query
    }
  });
}

export function normalizeAddresses(addresses: Address[]): Address[] {
  return addresses
    .map(a => {
      try {
        return getAddress(a.toLowerCase());
      } catch (e) {}
    })
    .filter(a => a) as Address[];
}

export function normalizeHandles(handles: Handle[]): Handle[] {
  return handles.filter(h => /^[^\s]*\.[^\s]*$/.test(h)).map(h => h.toLowerCase());
}

export function isSilencedError(error: any): boolean {
  return (
    ['invalid token ID', 'is not supported', 'execution reverted'].some(m =>
      error.message?.includes(m)
    ) || ['TIMEOUT', 'ECONNABORTED', 'ETIMEDOUT'].some(c => error.code?.includes(c))
  );
}

export function mapOriginalInput(
  input: string[],
  results: Record<string, string>
): Record<string, string> {
  const inputLc = input.filter(a => a).map(i => i.toLowerCase());
  const resultLc = Object.fromEntries(
    Object.entries(results).map(([key, value]) => [key.toLowerCase(), value])
  );

  return withoutEmptyValues(
    Object.fromEntries(
      inputLc.map((key, index) => {
        return [input[index], resultLc[key]];
      })
    )
  );
}
