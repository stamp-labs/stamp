import snapshot from '@snapshot-labs/snapshot.js';
import { capture } from '@snapshot-labs/snapshot-sentry';
import { provider, Address, Handle } from './utils';

const NETWORK = '137';

export async function lookupAddresses(addresses: Address[]): Promise<Record<Address, Handle>> {
  const abi = ['function reverseNameOf(address addr) view returns (string reverseUri)'];

  try {
    const multi = new snapshot.utils.Multicaller(NETWORK, provider(NETWORK), abi);
    addresses.forEach(address =>
      multi.call(address, '0xa9a6A3626993D487d2Dbda3173cf58cA1a9D9e9f', 'reverseNameOf', [address])
    );

    const names = (await multi.execute()) as Record<Address, Handle>;

    return Object.fromEntries(Object.entries(names).filter(([, name]) => !!name));
  } catch (e) {
    capture(e, { addresses });
    return {};
  }
}
