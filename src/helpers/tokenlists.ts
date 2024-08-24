import { getAddress } from '@ethersproject/address';

type TokenlistToken = {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  logoURI: string;
  decimals: number;
};

type AggregatedTokenListToken = Omit<TokenlistToken, 'logoURI'> & {
  logoURIs: string[];
};

type AggregatedTokenList = Map<string, AggregatedTokenListToken>;

const TOKENLISTS_URL =
  'https://raw.githubusercontent.com/Uniswap/tokenlists-org/master/src/token-lists.json';
const REQUEST_TIMEOUT = 5000;
const TTL = 1000 * 60 * 60 * 24;
let aggregatedTokenList: AggregatedTokenList = new Map();
let lastUpdateTimestamp: number | undefined;

function isTokenlistToken(token: unknown): token is TokenlistToken {
  if (typeof token !== 'object' || token === null) {
    return false;
  }

  const { chainId, address, symbol, name, logoURI, decimals } = token as TokenlistToken;

  return (
    typeof chainId === 'number' &&
    typeof address === 'string' &&
    typeof symbol === 'string' &&
    typeof name === 'string' &&
    typeof logoURI === 'string' &&
    typeof decimals === 'number'
  );
}

function isExpired() {
  return !lastUpdateTimestamp || Date.now() - lastUpdateTimestamp > TTL;
}

function normalizeUri(uri: string) {
  if (!uri.startsWith('http') && uri.endsWith('.eth')) {
    uri = `https://${uri}.limo`;
  }
  if (uri.startsWith('ipfs://')) {
    uri = `https://ipfs.io/ipfs/${uri.slice(7)}`;
  }
  return uri;
}

async function fetchUri(uri: string) {
  return await fetch(normalizeUri(uri), { signal: AbortSignal.timeout(REQUEST_TIMEOUT) });
}

async function fetchListUris() {
  try {
    const response = await fetchUri(TOKENLISTS_URL);
    const tokenLists = await response.json();
    const uris = Object.keys(tokenLists);

    return uris;
  } catch (e) {
    return [];
  }
}

export async function fetchTokens(listUri: string) {
  try {
    const response = await fetchUri(listUri);
    const { tokens } = await response.json();
    if (!tokens || !Array.isArray(tokens)) {
      throw new Error('Invalid token list');
    }
    return tokens.filter(isTokenlistToken);
  } catch (e) {
    return [];
  }
}

const REPLACE_SIZE_REGEXES: { pattern: RegExp; replacement: string }[] = [
  {
    pattern: /assets.coingecko.com\/coins\/images\/(\d+)\/(thumb|small)/,
    replacement: 'assets.coingecko.com/coins/images/$1/large'
  }
];

export function replaceURIPatterns(uri: string) {
  for (const { pattern, replacement } of REPLACE_SIZE_REGEXES) {
    uri = uri.replace(pattern, replacement);
  }
  return uri;
}

const sizeKeywords = [
  'xxl',
  'xl',
  'large',
  'lg',
  'big',
  'medium',
  'md',
  'small',
  'sm',
  'thumb',
  'icon',
  'xs',
  'xxs'
];

/**
 * Sorts URIs by the size keyword in the URI. The order in the array above is the order of the sort.
 */
export function sortByKeywordMatch(a: string, b: string) {
  try {
    const aPath = new URL(a).pathname;
    const bPath = new URL(b).pathname;

    const keywordRegex = new RegExp(`\\b(${sizeKeywords.join('|')})\\b`);

    const aMatch = aPath.match(keywordRegex);
    const bMatch = bPath.match(keywordRegex);

    if (aMatch && bMatch) {
      return sizeKeywords.indexOf(aMatch[1]) - sizeKeywords.indexOf(bMatch[1]);
    } else if (aMatch) {
      return -1;
    } else if (bMatch) {
      return 1;
    } else {
      return a.localeCompare(b);
    }
  } catch (e) {
    return 0;
  }
}

function getTokenKey(address: string, chainId: string) {
  return `${chainId}-${getAddress(address)}`;
}

export async function updateExpiredAggregatedTokenList() {
  if (!isExpired()) {
    return;
  }

  const newTokenMap = new Map<string, AggregatedTokenListToken>();

  const tokenListUris = await fetchListUris();
  const tokenLists = await Promise.all(tokenListUris.map(fetchTokens));

  for (const tokens of tokenLists) {
    for (const token of tokens) {
      const logoURI = normalizeUri(replaceURIPatterns(token.logoURI));
      const tokenKey = getTokenKey(token.address, token.chainId.toString());

      const existingToken = newTokenMap.get(tokenKey);
      if (existingToken) {
        existingToken.logoURIs.push(logoURI);
      } else {
        const newToken: AggregatedTokenListToken = {
          chainId: token.chainId,
          address: token.address,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          logoURIs: [logoURI]
        };
        newTokenMap.set(tokenKey, newToken);
      }
    }
  }

  newTokenMap.forEach(token => token.logoURIs.sort(sortByKeywordMatch));

  aggregatedTokenList = newTokenMap;
  lastUpdateTimestamp = Date.now();
}

export function findImageUrl(address: string, chainId: string) {
  const tokenKey = getTokenKey(address, chainId);
  const token = aggregatedTokenList.get(tokenKey);

  if (!token) {
    throw new Error('Token not found in aggregated tokenlist');
  }

  return token.logoURIs[0];
}
