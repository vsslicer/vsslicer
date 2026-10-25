// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, it } from 'vitest';
import { dropBlankLines } from '../src/domain/ascii.ts';

it('keeps a last line without a trailing newline (libbgcode remove_empty_lines)', () => {
  expect(dropBlankLines('G1 X1\n;\n\nG1 X2')).toBe('G1 X1\nG1 X2\n');
  expect(dropBlankLines('G1 X1\n\n')).toBe('G1 X1\n');
  expect(dropBlankLines('')).toBe('');
});
