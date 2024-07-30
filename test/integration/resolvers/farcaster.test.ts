import resolvers from '../../../src/resolvers';

describe('resolvers', () => {
  if (!process.env.NEYNAR_API_KEY) {
    it.todo('is missing NEYNAR_API_KEY');
  } else {
    describe('farcaster', () => {
      it('should return false for invalid address', async () => {
        const result = await resolvers.farcaster('0x556B14CbdA79A36dC33FcD461a04A5BCb5dC2A70!');

        expect(result).toBe(false);
      });

      it('should return false for address without farcaster account', async () => {
        const result = await resolvers.farcaster('0x2963fD170E12d748d0A80430DdC090e059f6013F');

        expect(result).toBe(false);
      });

      it('should resolve', async () => {
        const result = await resolvers.farcaster('0xd1a8Dd23e356B9fAE27dF5DeF9ea025A602EC81e');

        expect(result).toBeInstanceOf(Buffer);
        expect((result as Buffer).length).toBeGreaterThan(1000);
      });
    });
  }
});
