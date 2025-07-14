import { capture } from '@snapshot-labs/snapshot-sentry';
import { FetchError, isSilencedError } from '../addressResolvers/utils';
import { Address, Handle } from '../utils';

export const DEFAULT_CHAIN_ID = 'unstoppable-domains';

const SUPPORTED_TLDS = ['sonic'];

function normalizeHandles(handles: Handle[]): Handle[] {
  return handles.filter(h => SUPPORTED_TLDS.some(tld => h.endsWith(`.${tld}`)));
}

export default async function lookupDomains(address: Address, chainId: string): Promise<Handle[]> {
  if (chainId !== DEFAULT_CHAIN_ID) return [];

  if (!process.env.UNSTOPPABLE_DOMAINS_API_KEY) {
    return [];
  }

  try {
    const resp = await fetch(
      `https://api.unstoppabledomains.com/resolve/owners/${address}/domains`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UNSTOPPABLE_DOMAINS_API_KEY || ''}`
        }
      }
    );

    const data = await resp.json();

    return normalizeHandles(data.data.map((domain: any) => domain.meta.domain));
  } catch (e) {
    if (!isSilencedError(e)) {
      capture(e, { input: { address } });
    }
    throw new FetchError();
  }
}
