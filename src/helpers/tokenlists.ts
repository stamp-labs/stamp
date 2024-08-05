// (draft from top of my head)
export type TokenLists = {
  [network: string]: {
    name: string;
    logoURI: string;
    tokens: {
      address: string;
      chainId: number;
      name: string;
      symbol: string;
      decimals: number;
    }[];
  }[];
};

const tokenlists: TokenLists = {};

// TODO: process static tokenlists from remote sources

export default tokenlists;
