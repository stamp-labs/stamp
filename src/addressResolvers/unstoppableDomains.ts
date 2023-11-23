import snapshot from '@snapshot-labs/snapshot.js';
import Resolution, { NamingServiceName } from '@unstoppabledomains/resolution';
import { capture } from '@snapshot-labs/snapshot-sentry';
import { provider as getProvider, Address, Handle, withoutEmptyValues } from './utils';

const NETWORK = '137';
const provider = getProvider(NETWORK);

export async function lookupAddresses(addresses: Address[]): Promise<Record<Address, Handle>> {
  const abi = ['function reverseNameOf(address addr) view returns (string reverseUri)'];

  try {
    const multi = new snapshot.utils.Multicaller(NETWORK, provider, abi);
    addresses.forEach(address =>
      multi.call(address, '0xa9a6A3626993D487d2Dbda3173cf58cA1a9D9e9f', 'reverseNameOf', [address])
    );

    const names = (await multi.execute()) as Record<Address, Handle>;

    return withoutEmptyValues(names);
  } catch (e) {
    capture(e, { addresses });
    return {};
  }
}

export async function resolveNames(handles: Handle[]): Promise<Record<Handle, Address>> {
  const abi = ['function ownerOf(uint256 tokenId) external view returns (address address)'];

  try {
    const results = await Promise.all(
      handles.map(async handle => {
        try {
          const tokenId = new Resolution().namehash(handle, NamingServiceName.UNS);
          return await snapshot.utils.call(
            provider,
            abi,
            ['0xa9a6a3626993d487d2dbda3173cf58ca1a9d9e9f', 'ownerOf', [tokenId]],
            { blockTag: 'latest' }
          );
        } catch (e) {
          const message = (e as Error).message;
          if (!['invalid token ID', 'is not supported'].some(m => message.includes(m))) {
            capture(e);
          }
          return;
        }
      })
    );

    return withoutEmptyValues(
      Object.fromEntries(handles.map((handle, index) => [handle, results[index]]))
    );
  } catch (e) {
    capture(e, { handles });
    return {};
  }
}
