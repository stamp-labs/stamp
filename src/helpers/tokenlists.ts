export type AggregatedTokenList = {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  logoURI: string;
  decimals: number;
}[];

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

async function fetchList() {
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
    // TODO: validate response, use zod
    return tokens.tokens.filter((token: any) => token.logoURI);
  } catch (e) {
    console.warn(`Failed to fetch token list from ${tokenListUri}`);
    return [];
  }
}

export async function initAggregatedTokenList() {
  if (aggregatedTokenList && lastUpdateTimestamp && lastUpdateTimestamp > Date.now() - TTL) {
    console.info('Using in-memory aggregated token list');
    return aggregatedTokenList;
  }

  console.info('Initializing aggregated token list from tokenlists.org');

  const list: AggregatedTokenList = [];

  const uris = await fetchList();

  await Promise.all(
    uris.map(async tokenListUri => {
      const tokens = await fetchTokens(tokenListUri);
      list.push(...tokens);
    })
  );

  aggregatedTokenList = list;

  console.info(`Aggregated token list initialized with ${aggregatedTokenList.length} tokens`);
  lastUpdateTimestamp = Date.now();

  return aggregatedTokenList;
}
