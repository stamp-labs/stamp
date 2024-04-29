import fetch from 'node-fetch';
import { Provider, RpcProvider } from 'starknet';
import { getUrl, resize } from '../utils';
import { max } from '../constants.json';
import { fetchHttpImage } from './utils';

const provider = new Provider(
  new RpcProvider({
    nodeUrl: `https://starknet-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`
  })
);

function isStarknetDomain(domain: string): boolean {
  return domain.endsWith('.stark');
}

async function getStarknetAddress(domain: string): Promise<string | null> {
  const address = await provider.getAddressFromStarkName(domain);

  return address === '0x0' ? null : address;
}

async function getImage(domainOrAddress: string): Promise<string | null> {
  const address = isStarknetDomain(domainOrAddress)
    ? await getStarknetAddress(domainOrAddress)
    : domainOrAddress;

  if (!address) return null;

  return (await provider.getStarkProfile(address))?.profilePicture ?? null;
}

export default async function resolve(domainOrAddress: string) {
  try {
    let img_url = await getImage(domainOrAddress);

    if (img_url?.startsWith('https://api.starkurabu.com')) {
      const response = await fetch(img_url);
      const data = await response.json();

      img_url = data.image;
    }

    if (!img_url) return false;

    const input = await fetchHttpImage(getUrl(img_url));

    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
