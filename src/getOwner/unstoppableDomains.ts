import snapshot from '@snapshot-labs/snapshot.js';
import { namehash } from '@ethersproject/hash';
import { capture } from '@snapshot-labs/snapshot-sentry';
import { Address, Handle, provider as getProvider, isSilencedError } from '../utils';

export const NAME = 'Unstoppable Domains';
const ABI = ['function ownerOf(uint256 tokenId) external view returns (address address)'];

const CHAIN_CONFIG = {
  '146': {
    tld: ['sonic'],
    registryContractAddress: '0xDe1DAdcF11a7447C3D093e97FdbD513f488cE3b4'
  }
};
const DEFAULT_CHAIN_ID = Object.keys(CHAIN_CONFIG)[0];

function normalizeHandle(handle: Handle, chainId: string): Handle {
  const allowedDomains = CHAIN_CONFIG[chainId]?.tld || [];
  return allowedDomains.some(tld => handle.endsWith(`.${tld}`)) ? handle : '';
}

export default async function getOwner(
  handle: Handle,
  chainId = DEFAULT_CHAIN_ID
): Promise<Address | null> {
  try {
    const chainConfig = CHAIN_CONFIG[chainId];
    const normalizedHandle = normalizeHandle(handle, chainId);
    if (!chainConfig || !normalizedHandle) {
      return null;
    }

    const provider = getProvider(chainId);
    const tokenId = BigInt(namehash(normalizedHandle));
    return await snapshot.utils.call(
      provider,
      ABI,
      [chainConfig.registryContractAddress, 'ownerOf', [tokenId]],
      {
        blockTag: 'latest'
      }
    );
  } catch (e) {
    if (!isSilencedError(e)) {
      capture(e, { input: { handle } });
    }
    return null;
  }
}
