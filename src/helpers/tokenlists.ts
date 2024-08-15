import { getAddress } from '@ethersproject/address';

type TokenlistToken = {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  logoURI: string;
  decimals: number;
};

type AggregatedTokenList = TokenlistToken[];

const TOKENLISTS_URL =
  'https://raw.githubusercontent.com/Uniswap/tokenlists-org/master/src/token-lists.json';
const REQUEST_TIMEOUT = 2500;
const TTL = 1000 * 60 * 60 * 24;
let aggregatedTokenList: AggregatedTokenList = [];
let lastUpdateTimestamp: number | undefined;

function isExpired() {
  return !lastUpdateTimestamp || Date.now() - lastUpdateTimestamp > TTL;
}

function normalizeTokenListUri(tokenListUri: string) {
  if (!tokenListUri.startsWith('http') && tokenListUri.endsWith('.eth')) {
    tokenListUri = `https://${tokenListUri}.limo`;
  }
  return tokenListUri;
}

function normalizeTokenLogoUri(logoUri: string) {
  if (logoUri.startsWith('ipfs://')) {
    logoUri = `https://ipfs.io/ipfs/${logoUri.slice(7)}`;
  }
  return logoUri;
}

async function fetchListUris() {
  const response = await fetch(TOKENLISTS_URL, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT)
  });
  const tokenLists = await response.json();
  const uris = Object.keys(tokenLists);

  return uris;
}

async function fetchTokens(tokenListUri: string) {
  tokenListUri = normalizeTokenListUri(tokenListUri);

  try {
    const response = await fetch(tokenListUri, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    });
    const tokens = await response.json();
    if (!tokens.tokens || !Array.isArray(tokens.tokens)) {
      throw new Error('Invalid token list');
    }

    const tokensWithLogoUri = tokens.tokens.filter((token: any) => token.logoURI);

    return tokensWithLogoUri.map((token: any) => {
      return {
        ...token,
        logoURI: normalizeTokenLogoUri(token.logoURI)
      };
    });
  } catch (e) {
    console.warn(`Failed to fetch token list from ${tokenListUri}`);
    return [];
  }
}

const REPLACE_SIZE_REGEX: { pattern: RegExp; replacement: string }[] = [
  {
    pattern: /assets.coingecko.com\/coins\/images\/(\d+)\/(thumb|small)/,
    replacement: 'assets.coingecko.com/coins/images/$1/large'
  }
];

export function replaceSizePartsInImageUrls(list: AggregatedTokenList) {
  return list.map(token => {
    token.logoURI = REPLACE_SIZE_REGEX.reduce((acc, { pattern, replacement }) => {
      return acc.replace(pattern, replacement);
    }, token.logoURI);
    return token;
  });
}

export async function updateExpiredAggregatedTokenList() {
  if (!isExpired()) {
    return;
  }

  const list: AggregatedTokenList = [];

  const uris = await fetchListUris();

  await Promise.all(
    uris.map(async tokenListUri => {
      const tokens = await fetchTokens(tokenListUri);
      list.push(...tokens);
    })
  );

  aggregatedTokenList = replaceSizePartsInImageUrls(list);
  lastUpdateTimestamp = Date.now();
}

export function findImageUrl(address: string, chainId: string) {
  const checksum = getAddress(address);

  const token = aggregatedTokenList.find(token => {
    return token.chainId === parseInt(chainId) && getAddress(token.address) === checksum;
  });

  if (!token) {
    throw new Error('Token not found');
  }

  return token.logoURI;
}
