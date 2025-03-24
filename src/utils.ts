import axios from 'axios';
import sharp from 'sharp';
import snapshot from '@snapshot-labs/snapshot.js';
import { createHash } from 'crypto';
import { Response } from 'express';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import chains from './chains.json';
import constants from './constants.json';

export type Address = string;
export type Handle = string;
export type ResolverType =
  | 'avatar'
  | 'user-cover'
  | 'token'
  | 'space'
  | 'space-cover'
  | 'space-logo'
  | 'space-sx'
  | 'space-cover-sx'
  | 'address'
  | 'name';

const providers: Record<string, StaticJsonRpcProvider> = {};

const RESIZE_FITS = ['cover', 'contain', 'fill', 'inside', 'outside'];

export function getProvider(network: number): StaticJsonRpcProvider {
  if (!providers[`_${network}`])
    providers[`_${network}`] = new StaticJsonRpcProvider(
      {
        url: `https://rpc.snapshot.org/${network}`,
        timeout: 20e3,
        allowGzip: true
      },
      network
    );

  return providers[`_${network}`];
}

export function sha256(str) {
  return createHash('sha256')
    .update(str)
    .digest('hex');
}

export async function resize(input, w, h, options?) {
  return sharp(input)
    .resize(w, h, options)
    .webp()
    .toBuffer();
}

export function shortNameToChainId(shortName: string): string | null {
  return shortName in chains.SHORTNAME_TO_CHAIN_ID ? chains.SHORTNAME_TO_CHAIN_ID[shortName] : null;
}

export function chainIdToShortName(chainId: string): string | null {
  return chainId in chains.CHAIN_ID_TO_SHORTNAME ? chains.CHAIN_ID_TO_SHORTNAME[chainId] : null;
}

export function chainIdToName(chainId: string): string | null {
  if (chainId === '1') return 'ethereum';
  if (chainId === '56') return 'binance';
  if (chainId === '250') return 'fantom';
  if (chainId === '137') return 'polygon';
  if (chainId === '42161') return 'arbitrum';

  return null;
}

export async function parseQuery(id: string, type: ResolverType, query) {
  let address = id;
  let network = '1';
  let networkId: string | undefined = undefined;

  // Resolve format
  // let format;
  const chunks = id.split(':');
  if (chunks.length === 2) {
    // format = 'eip3770';
    address = chunks[1];
    networkId = chunks[0];
    network = shortNameToChainId(networkId) || '1';
  } else if (chunks.length === 3) {
    // format = 'caip10';
    address = chunks[2];
    network = chunks[1];
    networkId = chainIdToShortName(network) || 'eth';
  } else if (id.startsWith('did:')) {
    // format = 'did';
    address = id.slice(4);
  }
  // console.log('Format', format);

  address = address.toLowerCase();
  const size = 64;
  const maxSize = type.includes('-cover') ? constants.maxCover : constants.max;
  let s = query.s ? parseInt(query.s) : size;
  if (s < 1 || s > maxSize || isNaN(s)) s = size;
  let w = query.w ? parseInt(query.w) : s;
  if (w < 1 || w > maxSize || isNaN(w)) w = size;
  let h = query.h ? parseInt(query.h) : s;
  if (h < 1 || h > maxSize || isNaN(h)) h = size;

  return {
    address,
    network,
    networkId,
    w,
    h,
    fallback: query.fb === 'jazzicon' ? 'jazzicon' : 'blockie',
    cb: query.cb,
    resolver: query.resolver,
    fit: RESIZE_FITS.includes(query.fit) ? query.fit : undefined
  };
}

export function getUrl(url) {
  const gateway: string = process.env.IPFS_GATEWAY || 'cloudflare-ipfs.com';
  return snapshot.utils.getUrl(url, gateway);
}

export function getCacheKey({
  type,
  network,
  address,
  w,
  h,
  fallback,
  cb,
  fit
}: {
  type: ResolverType;
  network: string;
  address: string;
  w: number;
  h: number;
  fallback: string;
  cb?: string;
  fit?: string;
}) {
  const data = { type, network, address, w, h };
  if (fallback !== 'blockie') data['fallback'] = fallback;
  if (cb) data['cb'] = cb;
  if (fit) data['fit'] = fit;

  return sha256(JSON.stringify(data));
}

export function setHeader(res: Response, cacheType: 'SHORT_CACHE' | 'LONG_CACHE' = 'LONG_CACHE') {
  const ttl = cacheType === 'SHORT_CACHE' ? constants.shortTtl : constants.ttl;

  res.set({
    'Content-Type': 'image/webp',
    'Cache-Control': `public, max-age=${ttl}`,
    Expires: new Date(Date.now() + ttl * 1e3).toUTCString()
  });
}

export const getBaseAssetIconUrl = (chainId: string) => {
  // Matic
  if (chainId === '137') {
    return 'https://github-production-user-asset-6210df.s3.amazonaws.com/1968722/269347324-fc34c3a3-01e8-424a-80f6-0910374ea6de.svg';
  }

  // Apechain & Curtis
  if (chainId === '33139' || chainId === '33111') {
    return 'https://github.com/user-attachments/assets/0dc0a080-5b9c-4fa0-9b8d-7914eecc7e14';
  }

  return 'https://static.cdnlogo.com/logos/e/81/ethereum-eth.svg';
};

export function graphQlCall(
  url: string,
  query: string,
  options: any = {
    headers: {}
  }
) {
  return axios({
    url: url,
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      ...Object.fromEntries(
        Object.entries(options.headers).filter(([, value]) => value !== undefined && value !== null)
      )
    },
    timeout: 5e3,
    data: {
      query
    }
  });
}
