// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, it } from 'vitest';
import { bytesToLatin1, dropBlankLines, latin1ToBytes } from '../src/domain/ascii.ts';

it('keeps a last line without a trailing newline (libbgcode remove_empty_lines)', () => {
  expect(dropBlankLines('G1 X1\n;\n\nG1 X2')).toBe('G1 X1\nG1 X2\n');
  expect(dropBlankLines('G1 X1\n\n')).toBe('G1 X1\n');
  expect(dropBlankLines('')).toBe('');
});

it('latin1 conversion is byte-exact for all 256 values and fast', () => {
  const all = Uint8Array.from({ length: 256 }, (_, i) => i);
  const s = bytesToLatin1(all);
  expect([...s].map((c) => c.charCodeAt(0))).toEqual([...all]);
  expect([...latin1ToBytes(s)]).toEqual([...all]);
  const big = new Uint8Array(32e6).map((_, i) => (i * 31) & 255);
  const t = performance.now();
  const back = latin1ToBytes(bytesToLatin1(big));
  const mbps = 32 / ((performance.now() - t) / 1000);
  expect(back.length).toBe(big.length);
  expect(mbps).toBeGreaterThan(200);
});
