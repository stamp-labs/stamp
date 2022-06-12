import resolvers from '../../../src/resolvers';

describe('resolvers', () => {
  describe('selfid', () => {
    it('should return false if missing DID', async () => {
      const result = await resolvers.selfid('0x290ADCcA6253aCe88b10A6bb34C07a5Ad10fC6B0');

      expect(result).toBe(false);
    });

    it('should return false if has no avatar', async () => {
      const result = await resolvers.selfid('0xd98420cFB1cd92828D192565A824B5728a566B11');

      expect(result).toBe(false);
    });

    it('should resolve', async () => {
      const result = await resolvers.selfid('0x556B14CbdA79A36dC33FcD461a04A5BCb5dC2A70');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(1000);
    });
  });
});
