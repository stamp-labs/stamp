import axios from 'axios';
import snapshot from '@snapshot-labs/snapshot.js';
import { getAddress } from '@ethersproject/address';

export type Address = string;
export type Handle = string;

const broviderUrl = process.env.BROVIDER_URL || 'https://rpc.brovider.xyz';

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
    timeout: 5000,
    data: {
      query
    }
  });
}

export function normalizeAddresses(addresses: Address[]): Address[] {
  return addresses
    .map(a => {
      try {
        return getAddress(a);
      } catch (e) {}
    })
    .filter(a => a) as Address[];
}

export function isSilencedContractError(error: any): boolean {
  return (
    !['invalid token ID', 'is not supported', 'execution reverted'].some(m =>
      error.message?.includes(m)
    ) || error.code === 'TIMEOUT'
  );
}
