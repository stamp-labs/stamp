import { capture } from '@snapshot-labs/snapshot-sentry';
import { FetchError, isSilencedError } from '../addressResolvers/utils';
import { Address, Handle } from '../utils';

export const DEFAULT_CHAIN_ID = 'unstoppable-domains';

// Filter out invalid ENS domains like
// [0xa410d74c2b6736f223654461c22395a9b49e2c36fcfcbef22962a195a6a67c37].[0xd8cc269d5812cbdfe0adbba6897038c687381383d2e1cf56e0696d3133566d6e].eth
function normalizeHandles(handles: Handle[]): Handle[] {
  return handles.map(h => (/^[.a-z0-9-]+$/.test(h) ? h : '')).filter(h => h);
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
