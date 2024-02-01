import resolvers from '../../../src/resolvers';

describe('resolvers', () => {
  describe('blockie', () => {
    it('should resolve', async () => {
      const result = await resolvers.blockie('0x556B14CbdA79A36dC33FcD461a04A5BCb5dC2A70');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(1000);
    });
  });
});
