import getOwner from '../../src/getOwner';

describe('getOwner', () => {
  it('should return an address for shibarium', async () => {
    const result = await getOwner('boorger.shib', '109');
    expect(result).toContain('0x220bc93D88C0aF11f1159eA89a885d5ADd3A7Cf6');
  });

  it('should return an empty address for shibarium when domain does not exist', async () => {
    const result = await getOwner('invalid-domain-h.shib', '109');
    expect(result).toContain('0x0000000000000000000000000000000000000000');
  });

  it('should return an address for puppynet', async () => {
    const result = await getOwner('systematize752253.shib', '157');
    expect(result).toContain('0xc4B06a671831CdD66fdA1A287263103103DEC80D');
  });

  it('should return an empty address for puppynet when domain does not exist', async () => {
    const result = await getOwner('invalid-domain-h.shib', '157');
    expect(result).toContain('0x0000000000000000000000000000000000000000');
  });
});
