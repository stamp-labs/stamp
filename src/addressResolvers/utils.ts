import snapshot from '@snapshot-labs/snapshot.js';

export type Address = string;
export type Handle = string;

const broviderUrl = process.env.BROVIDER_URL || 'https://rpc.brovider.xyz';

export function provider(network: string) {
  return snapshot.utils.getProvider(network, { broviderUrl });
}
