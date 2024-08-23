import { replaceURIPatterns } from '../../src/helpers/tokenlists';

jest.setTimeout(60_000);

describe('tokenlists helper', () => {
  it('replaceURIPatterns should replace image size parts in URLs', () => {
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
});
