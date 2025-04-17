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

export default async function lookupDomains(
  address: Address,
  chainId = MAINNET
): Promise<Handle[]> {
  if (!constants.d3[chainId]?.apiUrl || !API_KEYS[chainId]) return [];

  try {
    const response = await fetch(
      `${constants.d3[chainId].apiUrl}/v1/partner/tokens/EVM/${address}?limit=25&skip=0`,
      {
        headers: { 'Content-Type': 'application/json', 'Api-Key': API_KEYS[chainId] }
      }
    );
    const data = await response.json();

    if (response.status === 404) {
      return [];
    }

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.status} - ${data.message}`);
    }

    return data.pageItems?.map(item => `${item.sld}.${item.tld}`) || [];
  } catch (e) {
    capture(e);
    return [];
  }
}
