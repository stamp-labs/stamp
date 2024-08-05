export type AggregatedTokenList = {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  logoURI: string;
  decimals: number;
}[];

const aggregatedTokenList: AggregatedTokenList = [];

export async function initAggregatedTokenList() {
  // let's start with a single one (refactor in next commits)
  const response = await fetch(
    'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json'
  );
  const tokens = await response.json();
  aggregatedTokenList.push(
    ...tokens.tokens.map((token: any) => ({
      chainId: 1,
      address: token.address,
      symbol: token.symbol,
      name: token.name,
      logoURI: token.logoURI,
      decimals: token.decimals
    }))
  );
}

export default aggregatedTokenList;
