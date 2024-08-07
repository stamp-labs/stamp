export type AggregatedTokenList = {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  logoURI: string;
  decimals: number;
}[];

function normalizeTokenListUri(tokenListUri: string) {
  if (!tokenListUri.startsWith('http') && tokenListUri.endsWith('.eth')) {
    tokenListUri = `https://${tokenListUri}.limo`;
  }
  return tokenListUri;
}

export async function initAggregatedTokenList() {
  console.info('Initializing aggregated token list from tokenlists.org');

  const aggregatedTokenList: AggregatedTokenList = [];

  const tokenListsResponse = await fetch(
    'https://raw.githubusercontent.com/Uniswap/tokenlists-org/master/src/token-lists.json'
  );
  const tokenLists = await tokenListsResponse.json();
  const uris = Object.keys(tokenLists);

  // TODO: parallelize
  for (let tokenListUri of uris) {
    tokenListUri = normalizeTokenListUri(tokenListUri);
    console.info(`Fetching list from ${tokenListUri}`);

    try {
      const response = await fetch(tokenListUri);
      const tokens = await response.json();
      // TODO: validate response, use zod
      aggregatedTokenList.push(...tokens.tokens.filter((token: any) => token.logoURI));
    } catch (e) {
      console.warn(`Failed to fetch token list from ${tokenListUri}`);
    }
  }

  console.info(`Aggregated token list initialized with ${aggregatedTokenList.length} tokens`);

  return aggregatedTokenList;
}
