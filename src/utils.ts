import { createHash } from 'crypto';

export function sha256(str) {
  return createHash('sha256')
    .update(str)
    .digest('hex');
}
