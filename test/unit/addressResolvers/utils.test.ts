import { normalizeHandles } from '../../../src/addressResolvers/utils';

describe('utils', () => {
  describe('normalizeHandles', () => {
    const VALID_DOMAINS = ['test.com', 'test.lens', 'test.ens'];
    const INVALID_DOMAINS = [1, '', false, 'hello world.com', 'hello'];

    it('should return only domain-like values', () => {
      // @ts-ignore
      expect(normalizeHandles([...INVALID_DOMAINS, ...VALID_DOMAINS])).toEqual([...VALID_DOMAINS]);
    });
  });
});
