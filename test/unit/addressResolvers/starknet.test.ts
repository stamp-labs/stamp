import { lookupAddresses, resolveNames } from '../../../src/addressResolvers/starknet';
import testAddressResolver from './helper';

testAddressResolver(
  'Starknet',
  lookupAddresses,
  resolveNames,
  '0x07ff6b17f07c4d83236e3fc5f94259a19d1ed41bbcf1822397ea17882e9b038d',
  'checkpoint.stark',
  '0x040f81578c2ab498c1252fdebdf1ed5dc083906dc7b9e3552c362db1c7c23a02',
  ['domain.crypto', 'domain.eth', 'domain.com'],
  false
);
