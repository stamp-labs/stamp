import { normalizeHandles, withoutEmptyAddress } from '../../../src/addressResolvers/utils';

describe('utils', () => {
  describe('normalizeHandles', () => {
    const VALID_DOMAINS = ['test.com', 'test.lens', 'test.ens'];
    const INVALID_DOMAINS = [1, '', false, 'hello world.com', 'hello'];

    it('should return only domain-like values', () => {
      // @ts-ignore
      expect(normalizeHandles([...INVALID_DOMAINS, ...VALID_DOMAINS])).toEqual([...VALID_DOMAINS]);
    });
  });

  describe('withoutEmptyAddress', () => {
    const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

    it('should remove entry with EMPTY_ADDRESS key', () => {
      const input = {
        [EMPTY_ADDRESS]: 'some value'
      };
      expect(withoutEmptyAddress(input)).toEqual({});
    });

    it('should keep normal entries', () => {
      const input = {
        '0x123': 'value1',
        '0x456': 'value2'
      };
      expect(withoutEmptyAddress(input)).toEqual(input);
    });

    it('should handle mixed entries', () => {
      const input = {
        [EMPTY_ADDRESS]: 'empty',
        '0x123': 'value1',
        '0x456': 'value2'
      };
      expect(withoutEmptyAddress(input)).toEqual({
        '0x123': 'value1',
        '0x456': 'value2'
      });
    });

    it('should handle empty object', () => {
      expect(withoutEmptyAddress({})).toEqual({});
    });
  });
});
