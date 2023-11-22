import axios from 'axios';
import snapshot from '@snapshot-labs/snapshot.js';

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
    data: {
      query
    }
  });
}
