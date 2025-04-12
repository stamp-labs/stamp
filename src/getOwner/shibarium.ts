import { Address, EMPTY_ADDRESS, Handle } from '../utils';

const API_URLS = {
  '109': 'https://api-public.d3.app',
  '157': 'https://api-public-stage.d3.app'
};

const API_KEYS = {
  '109': process.env.D3_API_KEY_MAINNET,
  '157': process.env.D3_API_KEY_TESTNET
};

export default async function getOwner(handle: Handle, chainId = '109'): Promise<Address> {
  if (!handle.endsWith('.shib')) return EMPTY_ADDRESS;
  if (!API_URLS[chainId]) return EMPTY_ADDRESS;

  const apiKey = API_KEYS[chainId];

  if (!apiKey) return EMPTY_ADDRESS;

  const response = await fetch(
    `${API_URLS[chainId]}/v1/partner/token/${handle.replace(/\.shib$/, '')}/shib`,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Api-Key': apiKey
      }
    }
  );

  if (response.status === 404) return EMPTY_ADDRESS;
  if (!response.ok) throw new Error(`Error fetching owner: ${response.statusText}`);

  const data = await response.json();

  if (data.status !== 'registered' || new Date(data.expirationDate) < new Date()) {
    return EMPTY_ADDRESS;
  }

  return data.owner;
}
