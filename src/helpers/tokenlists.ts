// (draft from top of my head)
export type AggregatedTokenList = {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  logoURI: string;
  decimals: number;
}[];

const aggregatedTokenList: AggregatedTokenList = [];

// TODO: process static tokenlists from remote sources

export default aggregatedTokenList;
