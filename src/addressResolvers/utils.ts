import { getAddress } from '@ethersproject/address';
import { Address, Handle, EMPTY_ADDRESS } from '../utils';

export function isEvmAddress(address: Address): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isStarknetAddress(address: Address): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(address);
}

export function withoutEmptyValues(obj: Record<string, any>) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value));
}

export function withoutEmptyAddress(obj: Record<string, any>) {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => key !== EMPTY_ADDRESS));
}

export function normalizeAddresses(addresses: Address[]): Address[] {
  return addresses
    .map(a => {
      if (isStarknetAddress(a)) {
        return a.toLowerCase();
      }
      try {
        return getAddress(a.toLowerCase());
      } catch (e) {}
    })
    .filter(a => a) as Address[];
}

export function normalizeHandles(handles: Handle[]): Handle[] {
  return handles.filter(h => /^[^\s]*\.[^\s]*$/.test(h)).map(h => h.toLowerCase());
}

export function mapOriginalInput(
  input: string[],
  results: Record<string, string>
): Record<string, string> {
  const inputLc = input.map(i => i?.toLowerCase());
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
