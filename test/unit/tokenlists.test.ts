import { replaceSizePartsInImageUrls } from '../../src/helpers/tokenlists';

test('replaceSizePartsInImageUrls should replace image size parts in URLs', () => {
  const tokenList = [
    {
      chainId: 1,
      address: '0x1234567890abcdef',
      symbol: 'ABC',
      name: 'Token ABC',
      logoURI: 'https://assets.coingecko.com/coins/images/123/thumb',
      decimals: 18
    },
    {
      chainId: 1,
      address: '0xabcdef1234567890',
      symbol: 'DEF',
      name: 'Token DEF',
      logoURI: 'https://assets.coingecko.com/coins/images/456/small',
      decimals: 18
    }
  ];

  const expectedTokenList = [
    {
      chainId: 1,
      address: '0x1234567890abcdef',
      symbol: 'ABC',
      name: 'Token ABC',
      logoURI: 'https://assets.coingecko.com/coins/images/123/large',
      decimals: 18
    },
    {
      chainId: 1,
      address: '0xabcdef1234567890',
      symbol: 'DEF',
      name: 'Token DEF',
      logoURI: 'https://assets.coingecko.com/coins/images/456/large',
      decimals: 18
    }
  ];

  const result = replaceSizePartsInImageUrls(tokenList);

  expect(result).toEqual(expectedTokenList);
});
