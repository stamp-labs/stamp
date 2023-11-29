import snapshot from '@snapshot-labs/snapshot.js';
import Resolution, { NamingServiceName } from '@unstoppabledomains/resolution';
import { capture } from '@snapshot-labs/snapshot-sentry';
import {
  provider as getProvider,
  Address,
  Handle,
  withoutEmptyValues,
  isSilencedContractError,
  FetchError
} from './utils';

export const NAME = 'Unstoppable Domains';
const NETWORK = '137';
const provider = getProvider(NETWORK);

function normalizeHandles(handles: Handle[]): Handle[] {
  return handles.map(h => (h.match(RegExp('^[.a-z0-9-]+$')) ? h : ''));
}

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
    if (!isSilencedContractError(e)) {
      capture(e, { input: { addresses } });
    }
    throw new FetchError();
  }
}

export async function resolveNames(handles: Handle[]): Promise<Record<Handle, Address>> {
  const abi = ['function ownerOf(uint256 tokenId) external view returns (address address)'];

  const normalizedHandles = normalizeHandles(handles).filter(h => h);

  if (normalizedHandles.length === 0) return {};

  try {
    const results = await Promise.all(
      normalizedHandles.map(async handle => {
        try {
          const tokenId = new Resolution().namehash(handle, NamingServiceName.UNS);
          return await snapshot.utils.call(
            provider,
            abi,
            ['0xa9a6a3626993d487d2dbda3173cf58ca1a9d9e9f', 'ownerOf', [tokenId]],
            { blockTag: 'latest' }
          );
        } catch (e) {
          if (isSilencedContractError(e)) {
            capture(e, { input: { handle } });
          }
          return;
        }
      })
    );

    return withoutEmptyValues(
      Object.fromEntries(normalizedHandles.map((handle, index) => [handle, results[index]]))
    );
  } catch (e) {
    capture(e, { input: { handles: normalizedHandles } });
    throw new FetchError();
  }
}
