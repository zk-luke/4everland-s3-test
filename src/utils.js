import { createHash } from 'crypto';

export function sha256(input) {
  return createHash('sha256').update(input).digest('hex');
}