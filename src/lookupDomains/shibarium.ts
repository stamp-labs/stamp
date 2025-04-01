import fetch from 'node-fetch';
import { capture } from '@snapshot-labs/snapshot-sentry';
import { Address, Handle } from '../utils';

export const SUPPORTED_CHAINS = ['109'];

const API_URL = 'https://www.shibariumscan.io/api/v2';
const SHIBD3_TOKEN_ADDRESS = '0xDe74799371Ceac11A0F52BA2694392A391D0dA18';

function findShibNameContract(item: any) {
  return item.token.address === SHIBD3_TOKEN_ADDRESS;
}

function filterOutExpiredNames(instance: any) {
  return (
    instance.metadata.attributes.find((attr: any) => attr.trait_type === 'Expiration Date').value *
      1000 >
    Date.now()
  );
}

function formatName(instance: any) {
  return instance.metadata.name.replace(/\*shib$/, '.shib');
}

export default async function lookupDomains(
  address: Address,
  chainId = SUPPORTED_CHAINS[0]
): Promise<Handle[]> {
  if (!SUPPORTED_CHAINS.includes(chainId)) return [];

  try {
    const response = await fetch(`${API_URL}/addresses/${address}/nft/collections?type=ERC-721`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();

    return (
      data.items
        ?.find(findShibNameContract)
        ?.token_instances?.filter(filterOutExpiredNames)
        .map(formatName) || []
    );
  } catch (e) {
    capture(e);
    return [];
  }
}
