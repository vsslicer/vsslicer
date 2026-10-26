// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, it } from 'vitest';
import { bytesToLatin1, dropBlankLines, latin1ToBytes } from '../src/domain/ascii.ts';

it('keeps a last line without a trailing newline (libbgcode remove_empty_lines)', () => {
  expect(dropBlankLines('G1 X1\n;\n\nG1 X2')).toBe('G1 X1\nG1 X2\n');
  expect(dropBlankLines('G1 X1\n\n')).toBe('G1 X1\n');
  expect(dropBlankLines('')).toBe('');
});

it('latin1 conversion is byte-exact for all 256 values and round-trips 32 MB', () => {
  const all = Uint8Array.from({ length: 256 }, (_, i) => i);
  const s = bytesToLatin1(all);
  expect([...s].map((c) => c.charCodeAt(0))).toEqual([...all]);
  expect([...latin1ToBytes(s)]).toEqual([...all]);
  const big = new Uint8Array(32e6).map((_, i) => (i * 31) & 255);
  const back = latin1ToBytes(bytesToLatin1(big));
  expect(back.length).toBe(big.length);
  expect([...back.subarray(0, 1000)]).toEqual([...big.subarray(0, 1000)]);
  expect([...back.subarray(-1000)]).toEqual([...big.subarray(-1000)]);
}, 60_000); // hang guard only, no throughput assertion

it('latin1ToBytes returns an exact, unpooled ArrayBuffer', () => {
  const b = latin1ToBytes('G1 X1');
  expect(b.byteOffset).toBe(0);
  expect(b.buffer.byteLength).toBe(5);
});
