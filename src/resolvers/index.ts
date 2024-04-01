import blockie from './blockie';
import jazzicon from './jazzicon';
import ens from './ens';
import trustwallet from './trustwallet';
import snapshot from './snapshot';
import space from './space';
import { resolveAvatar as sxResolveAvatar, resolveCover as sxResolveCover } from './space-sx';
import selfid from './selfid';
import lens from './lens';
import farcaster from './farcaster';
import zapper from './zapper';
import starknet from './starknet';

export default {
  blockie,
  jazzicon,
  ens,
  trustwallet,
  snapshot,
  space,
  'space-sx': sxResolveAvatar,
  'space-cover-sx': sxResolveCover,
  selfid,
  lens,
  farcaster,
  zapper,
  starknet
};
