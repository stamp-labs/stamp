import blockie from './blockie';
import jazzicon from './jazzicon';
import ens from './ens';
import trustwallet from './trustwallet';
import { resolveAvatar as sResolveAvatar, resolveCover as sResolveCover } from './snapshot';
import space from './space';
import { resolveAvatar as sxResolveAvatar, resolveCover as sxResolveCover } from './space-sx';
import selfid from './selfid';
import lens from './lens';
import zapper from './zapper';
import starknet from './starknet';
import farcaster from './farcaster';
import tokenlists from './tokenlists';

export default {
  blockie,
  jazzicon,
  ens,
  trustwallet,
  snapshot: sResolveAvatar,
  'user-cover': sResolveCover,
  space,
  'space-sx': sxResolveAvatar,
  'space-cover-sx': sxResolveCover,
  selfid,
  lens,
  zapper,
  starknet,
  farcaster,
  tokenlists
};
