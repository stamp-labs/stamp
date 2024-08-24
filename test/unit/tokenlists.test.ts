import { replaceURIPatterns, sortByKeywordMatch } from '../../src/helpers/tokenlists';

jest.setTimeout(60_000);

describe('tokenlists helper', () => {
  it('replaceURIPatterns should replace known image size related parts in URLs', () => {
    const uris = [
      'https://assets.coingecko.com/coins/images/123/thumb',
      'https://assets.coingecko.com/coins/images/456/small'
    ];

    const expectedUris = [
      'https://assets.coingecko.com/coins/images/123/large',
      'https://assets.coingecko.com/coins/images/456/large'
    ];

    uris.forEach((uri, i) => {
      expect(replaceURIPatterns(uri)).toBe(expectedUris[i]);
    });
  });

  it('sortByKeywordMatch should sort URIs by size keywords', () => {
    const uris = [
      'https://assets.coingecko.com/coins/images/123/thumb',
      'https://assets.coingecko.com/coins/images/2021/xxs',
      'https://assets.coingecko.com/coins/images/456-small',
      'https://assets.coingecko.com/coins/images/789/medium',
      'https://assets.coingecko.com/coins/images/1011/large',
      'https://assets.xl.coingecko.com/coins/images/1213',
      'https://assets.coingecko.com/coins/images/1415/xxl',
      'https://assets.coingecko.com/coins/images/1617/icon',
      'https://assets.coingecko.com/coins/images/2021/lg/logo.png',
      'https://assets.coingecko.com/coins/images/2021/md-logo.png'
    ];

    const expectedUris = [
      'https://assets.coingecko.com/coins/images/1415/xxl',
      'https://assets.coingecko.com/coins/images/1011/large',
      'https://assets.coingecko.com/coins/images/2021/lg/logo.png',
      'https://assets.coingecko.com/coins/images/789/medium',
      'https://assets.coingecko.com/coins/images/2021/md-logo.png',
      'https://assets.coingecko.com/coins/images/456-small',
      'https://assets.coingecko.com/coins/images/123/thumb',
      'https://assets.coingecko.com/coins/images/1617/icon',
      'https://assets.coingecko.com/coins/images/2021/xxs',

      // no keyword, should be at the end (domain part should be ignored)
      'https://assets.xl.coingecko.com/coins/images/1213'
    ];

    expect(uris.sort(sortByKeywordMatch)).toEqual(expectedUris);
  });
});
