import snapshot from '@snapshot-labs/snapshot.js';
import Resolution, { NamingServiceName } from '@unstoppabledomains/resolution';
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
    capture(e);
    return {};
  }
}

export async function resolveName(handle: string): Promise<Address | undefined> {
  const abi = ['function ownerOf(uint256 tokenId) external view returns (address address)'];

  try {
    const tokenId = new Resolution().namehash(handle, NamingServiceName.UNS);
    return await snapshot.utils.call(
      provider(NETWORK),
      abi,
      ['0xa9a6a3626993d487d2dbda3173cf58ca1a9d9e9f', 'ownerOf', [tokenId]],
      { blockTag: 'latest' }
    );
  } catch (e) {
    if (!(e as Error).message.includes('invalid token ID')) {
      capture(e);
    }
  }
}
