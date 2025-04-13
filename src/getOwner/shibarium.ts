import { Address, EMPTY_ADDRESS, Handle } from '../utils';
import constants from '../constants.json';

const MAINNET = '109';
const TESTNET = '157';
const TLD = 'shib';

const API_KEYS = {
  [MAINNET]: process.env.D3_API_KEY_MAINNET,
  [TESTNET]: process.env.D3_API_KEY_TESTNET
};

export default async function getOwner(handle: Handle, chainId = MAINNET): Promise<Address> {
  if (!handle.endsWith(`.${TLD}`) || !constants.d3Api[chainId] || !API_KEYS[chainId])
    return EMPTY_ADDRESS;

  const response = await fetch(
    `${constants.d3Api[chainId]}/v1/partner/token/${handle.replace(/\.shib$/, '')}/shib`,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Api-Key': API_KEYS[chainId]
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
