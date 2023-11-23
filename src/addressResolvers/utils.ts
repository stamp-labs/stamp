import snapshot from '@snapshot-labs/snapshot.js';
import { getAddress } from '@ethersproject/address';

export type Address = string;
export type Handle = string;

const broviderUrl = process.env.BROVIDER_URL || 'https://rpc.brovider.xyz';

export function provider(network: string) {
  return snapshot.utils.getProvider(network, { broviderUrl });
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
