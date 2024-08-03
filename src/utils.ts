import axios from 'axios';
import sharp from 'sharp';
import snapshot from '@snapshot-labs/snapshot.js';
import { createHash } from 'crypto';
import { Response } from 'express';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import constants from './constants.json';

export type Address = string;
export type Handle = string;
export type ResolverType =
  | 'avatar'
  | 'user-cover'
  | 'token'
  | 'space'
  | 'space-sx'
  | 'space-cover-sx'
  | 'address'
  | 'name';

const providers: Record<string, StaticJsonRpcProvider> = {};

export function getProvider(network: number): StaticJsonRpcProvider {
  if (!providers[`_${network}`])
    providers[`_${network}`] = new StaticJsonRpcProvider(
      {
        url: `https://rpc.brovider.xyz/${network}`,
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

export async function resize(input, w, h) {
  return sharp(input)
    .resize(w, h)
    .webp()
    .toBuffer();
}

export function shortNameToChainId(shortName: string) {
  if (shortName === 'eth') return '1';
  if (shortName === 'bsc') return '56';
  if (shortName === 'ftm') return '250';
  if (shortName === 'matic') return '137';
  if (shortName === 'arb1') return '42161';

  return null;
}

function parseIdentifier(identifier: string) {
  const chunks = identifier.split(':');
  let address = chunks[0];
  let network = '1';

  if (chunks.length === 2) {
    // eip3770
    address = chunks[1];
    network = shortNameToChainId(chunks[0]) || '1';
  } else if (chunks.length === 3) {
    // caip10
    address = chunks[2];
    network = chunks[1];
  } else if (chunks[0] === 'did') {
    // did
    address = identifier.slice(4);
  }

  address = address.toLowerCase();

  return { address, network };
}

function parseRequestedSize(query: any, type: ResolverType) {
  const size = 64;
  const maxSize = type.includes('-cover') ? constants.maxCover : constants.max;
  let s = query.s ? parseInt(query.s) : size;
  if (s < 1 || s > maxSize || isNaN(s)) s = size;
  let w = query.w ? parseInt(query.w) : s;
  if (w < 1 || w > maxSize || isNaN(w)) w = size;
  let h = query.h ? parseInt(query.h) : s;
  if (h < 1 || h > maxSize || isNaN(h)) h = size;

  return { w, h };
}

export async function parseQuery(identifier: string, type: ResolverType, query: any) {
  const { address, network } = parseIdentifier(identifier);
  const { w, h } = parseRequestedSize(query, type);
  const fallback = query.fb === 'jazzicon' ? 'jazzicon' : 'blockie';
  const { cb, resolver } = query;

  return {
    address,
    network,
    w,
    h,
    fallback,
    cb,
    resolver
  };
}

export function chainIdToName(chainId: string) {
  if (chainId === '1') return 'ethereum';
  if (chainId === '56') return 'binance';
  if (chainId === '250') return 'fantom';
  if (chainId === '137') return 'polygon';
  if (chainId === '42161') return 'arbitrum';

  return null;
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
  cb
}: {
  type: ResolverType;
  network: string;
  address: string;
  w: number;
  h: number;
  fallback: string;
  cb?: string;
}) {
  const data = { type, network, address, w, h };
  if (fallback !== 'blockie') data['fallback'] = fallback;
  if (cb) data['cb'] = cb;

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
  if (chainId === '137') {
    return 'https://github-production-user-asset-6210df.s3.amazonaws.com/1968722/269347324-fc34c3a3-01e8-424a-80f6-0910374ea6de.svg';
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
