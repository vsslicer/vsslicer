// SPDX-License-Identifier: AGPL-3.0-or-later
// Checked by `tsc -p tsconfig.test.json` (part of `pnpm test`): a changed field list fails to compile.
import { expectTypeOf, test } from 'vitest';
import type { Chunk, Diagnostic, Layer, Parse, ParsedFile, ParseOptions } from '../src/index.ts';

test('ParsedFile field list', () => {
  expectTypeOf<keyof ParsedFile>().toEqualTypeOf<
    'slicer' | 'moveCount' | 'moves' | 'layers' | 'markers' | 'diagnostics'
  >();
  expectTypeOf<ParsedFile['moves']>().toEqualTypeOf<ArrayBuffer[]>();
  expectTypeOf<ParsedFile['layers']>().toEqualTypeOf<Layer[]>();
  expectTypeOf<keyof Layer>().toEqualTypeOf<'z' | 'firstMove'>();
});

test('Chunk field list', () => {
  expectTypeOf<keyof Chunk>().toEqualTypeOf<
    'moves' | 'moveCount' | 'firstMove' | 'layers' | 'markers' | 'diagnostics' | 'bytesRead' | 'slicer'
  >();
  expectTypeOf<Chunk['moves']>().toEqualTypeOf<ArrayBuffer>();
});

test('Diagnostic carries code, severity and file offset', () => {
  expectTypeOf<Diagnostic>().toEqualTypeOf<{
    code: string;
    severity: 'error' | 'warning' | 'info';
    fileOffset: number;
    message: string;
  }>();
});

test('parse(source, opts) -> AsyncIterable<Chunk>', () => {
  expectTypeOf<Parameters<Parse>>().toEqualTypeOf<[source: AsyncIterable<Uint8Array>, opts?: ParseOptions]>();
  expectTypeOf<ReturnType<Parse>>().toEqualTypeOf<AsyncIterable<Chunk>>();
});
