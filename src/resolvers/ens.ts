import axios from 'axios';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { resize } from '../utils';
import { max } from '../constants.json';

async function resolveName(network, address) {
  const provider = new StaticJsonRpcProvider('https://rpc.ankr.com/eth');
  const abi = ['function getNames(address[]) view returns (string[])'];
  const contract = new Contract('0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C', abi, provider);
  const names = await contract.getNames([address]);
  return names[0];
}

export default async function resolve(address, network) {
  try {
    const name = await resolveName(network, address);
    const url = `https://metadata.ens.domains/mainnet/avatar/${name}`;
    const input = (await axios({ url, responseType: 'arraybuffer' })).data as Buffer;
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
