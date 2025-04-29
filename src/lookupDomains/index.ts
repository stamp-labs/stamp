import { isAddress } from '@ethersproject/address';
import { Address, Handle } from '../utils';
import ens, { DEFAULT_CHAIN_ID as ENS_DEFAULT_CHAIN_ID } from './ens';
import shibarium, { DEFAULT_CHAIN_ID as SHIBARIUM_DEFAULT_CHAIN_ID } from './shibarium';

const RESOLVERS = [ens, shibarium];

export default async function lookupDomains(
  address: Address,
  chains: string | string[] = [ENS_DEFAULT_CHAIN_ID, SHIBARIUM_DEFAULT_CHAIN_ID]
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
