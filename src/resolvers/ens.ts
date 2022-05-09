import axios from 'axios';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { resize } from '../utils';
import { max } from '../constants.json';
import { AvatarResolver } from '@ensdomains/ens-avatar';
import jsdom from 'jsdom';
import { Contract } from 'ethers';

export async function getAvatar(provider, name) {
  const avt = new AvatarResolver(provider);
  const avatarURI = await avt.getAvatar(name, { jsdomWindow: jsdom });
  return avatarURI;
}

export async function resolveName(address) {
  const provider = new StaticJsonRpcProvider('https://rpc.ankr.com/eth');
  const abi = ['function getNames(address[]) view returns (string[])'];
  const contract = new Contract('0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C', abi, provider);
  const names = await contract.getNames([address]);
  return names[0];
}

export async function resolveName_ethers(address) {
  const provider = new StaticJsonRpcProvider('https://rpc.ankr.com/eth');
  const name = await provider.lookupAddress(address);
  return name;
}

export default async function resolve(address) {
  try {
    const provider = new StaticJsonRpcProvider('https://rpc.ankr.com/eth');
    const name = await provider.lookupAddress(address);
    if (!name) return false;
    const url = await getAvatar(provider, name);
    if (!url) return false;
    const input = (await axios({ url, responseType: 'arraybuffer' })).data as Buffer;
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
