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

const TTL = 1000 * 60 * 60 * 24;
let aggregatedTokenList: AggregatedTokenList | undefined;
let lastUpdateTimestamp: number | undefined;

function normalizeTokenListUri(tokenListUri: string) {
  if (!tokenListUri.startsWith('http') && tokenListUri.endsWith('.eth')) {
    tokenListUri = `https://${tokenListUri}.limo`;
  }
  return tokenListUri;
}

const TOKENLISTS_URL =
  'https://raw.githubusercontent.com/Uniswap/tokenlists-org/master/src/token-lists.json';

async function fetchListUris() {
  const response = await fetch(TOKENLISTS_URL);
  const tokenLists = await response.json();
  const uris = Object.keys(tokenLists);

  return uris;
}

async function fetchTokens(tokenListUri: string) {
  tokenListUri = normalizeTokenListUri(tokenListUri);
  console.info(`Fetching list from ${tokenListUri}`);

  try {
    const response = await fetch(tokenListUri);
    const tokens = await response.json();
    if (!tokens.tokens || !Array.isArray(tokens.tokens)) {
      throw new Error('Invalid token list');
    }

    return tokens.tokens.filter((token: any) => token.logoURI);
  } catch (e) {
    console.warn(`Failed to fetch token list from ${tokenListUri}`);
    return [];
  }
}

const REPLACE_SIZE_REGEX: { pattern: RegExp; replacement: string }[] = [
  {
    pattern: /assets.coingecko.com\/coins\/images\/(\d+)\/thumb/,
    replacement: 'assets.coingecko.com/coins/images/$1/large'
  }
];

function replaceSizePartsInImageUrls(list: AggregatedTokenList) {
  return list.map(token => {
    token.logoURI = REPLACE_SIZE_REGEX.reduce((acc, { pattern, replacement }) => {
      return acc.replace(pattern, replacement);
    }, token.logoURI);
    return token;
  });
}

console.log(
  replaceSizePartsInImageUrls([
    {
      address: '0x6b175474e89094c44da98b954eedeac495271d0f',
      chainId: 1,
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/1645646/thumb/dai.png',
      name: 'Dai Stablecoin',
      symbol: 'DAI'
    }
  ])
);

async function updateAggregatedTokenList() {
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

export async function initTokenLists() {
  await updateAggregatedTokenList();

  setInterval(() => {
    if (lastUpdateTimestamp && Date.now() - lastUpdateTimestamp > TTL) {
      updateAggregatedTokenList();
    }
  }, TTL);

  return true;
}

export async function findImageUrl(address: string, chainId: string) {
  const checksum = getAddress(address);

  if (!aggregatedTokenList) {
    throw new Error('Tokenlists not initialized');
  }

  const token = aggregatedTokenList.find(token => {
    return token.chainId === parseInt(chainId) && getAddress(token.address) === checksum;
  });
  if (!token) throw new Error('Token not found');

  return token.logoURI;
}
