import { isAddress } from '@ethersproject/address';
import { Address, Handle } from '../utils';
import ens from './ens';
import shibarium from './shibarium';

const RESOLVERS = [ens, shibarium];

export default async function lookupDomains(
  address: Address,
  chains: string | string[] = ['1']
): Promise<Handle[]> {
  const promises: Promise<Handle[]>[] = [];
  let chainIds = Array.isArray(chains) ? chains : [chains];
  chainIds = [...new Set(chainIds.map(String))];

  if (!isAddress(address)) return [];

  RESOLVERS.forEach(resolver => {
    chainIds.forEach(chain => {
      promises.push(resolver(address, chain));
    });
  });

  const domains = await Promise.all(promises);

  return domains.flat();
}
