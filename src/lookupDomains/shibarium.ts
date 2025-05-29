import fetch from 'node-fetch';
import { capture } from '@snapshot-labs/snapshot-sentry';
import { Address, Handle } from '../utils';
import constants from '../constants.json';

const MAINNET = '109';
const TESTNET = '157';

const API_KEYS = {
  [MAINNET]: process.env.D3_API_KEY_MAINNET,
  [TESTNET]: process.env.D3_API_KEY_TESTNET
};

export const DEFAULT_CHAIN_ID = MAINNET;

export default async function lookupDomains(
  address: Address,
  chainId = DEFAULT_CHAIN_ID
): Promise<Handle[]> {
  if (!constants.d3[chainId]?.apiUrl || !API_KEYS[chainId]) return [];

  const limit = 25;
  let skip = 0;
  const allDomains: Handle[] = [];
  let hasMore = true;
  const timeout = 10000; // 10 seconds

  try {
    while (hasMore) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(
          `${constants.d3[chainId].apiUrl}/v1/partner/tokens/EVM/${address}?limit=${limit}&skip=${skip}`,
          {
            headers: { 'Content-Type': 'application/json', 'Api-Key': API_KEYS[chainId] },
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        if (response.status === 404) {
          break;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        let data;
        try {
          data = await response.json();
        } catch (e) {
          throw new Error(`Invalid JSON response: ${(e as any).message}`);
        }

        const domains = data.pageItems?.map(item => `${item.sld}.${item.tld}`) || [];
        allDomains.push(...domains);

        hasMore = domains.length === limit;
        skip += limit;
      } catch (e) {
        capture(e, { input: { address, chainId, skip } });
        break;
      }
    }

    return allDomains;
  } catch (e) {
    capture(e);
    return allDomains;
  }
}
