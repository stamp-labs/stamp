import snapshot from '@snapshot-labs/snapshot.js';
import { capture } from '@snapshot-labs/snapshot-sentry';
import { ens_normalize } from '@adraffy/ens-normalize';
import { provider as getProvider, Address, Handle } from './utils';

const NETWORK = '1';
const provider = getProvider(NETWORK);

function normalizeNames(names: string[]) {
  return names.map(name => {
    try {
      return ens_normalize(name) === name ? name : '';
    } catch (e) {
      capture(e);
      return '';
    }
  });
}

export async function lookupAddresses(addresses: Address[]): Promise<Record<Address, Handle>> {
  const abi = ['function getNames(address[] addresses) view returns (string[] r)'];

  try {
    const reverseRecords = await snapshot.utils.call(
      provider,
      abi,
      ['0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C', 'getNames', [addresses]],
      { blockTag: 'latest' }
    );
    const validNames = normalizeNames(reverseRecords);

    return Object.fromEntries(
      addresses
        .map((address, index) => [address, validNames[index]])
        .filter((_, index) => !!validNames[index])
    );
  } catch (e) {
    capture(e);
    return {};
  }
}

export async function resolveName(handle: string): Promise<string | undefined> {
  try {
    const addressResolved = await provider.resolveName(handle);
    return addressResolved || undefined;
  } catch (e) {
    capture(e);
  }
}
