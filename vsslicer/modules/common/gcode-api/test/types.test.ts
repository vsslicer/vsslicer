// SPDX-License-Identifier: AGPL-3.0-or-later
// Checked by `tsc -p tsconfig.test.json` (part of `pnpm test`): any field added, removed, made
// optional or retyped fails to compile.
import { expectTypeOf, test } from 'vitest';
import type {
  Chunk,
  Diagnostic,
  Layer,
  Marker,
  Move,
  MoveRole,
  Parse,
  ParsedFile,
  ParseOptions,
  Slicer,
  StateChange,
  StateKind,
} from '../src/index.ts';

test('ParsedFile shape', () => {
  expectTypeOf<ParsedFile>().toEqualTypeOf<{
    slicer: Slicer;
    moveCount: number;
    moves: ArrayBuffer[];
    extrusion: ArrayBuffer[];
    stateChanges: ArrayBuffer[];
    layers: Layer[];
    markers: Marker[];
    diagnostics: Diagnostic[];
  }>();
});

test('Chunk shape', () => {
  expectTypeOf<Chunk>().toEqualTypeOf<{
    moves: ArrayBuffer;
    extrusion: ArrayBuffer;
    stateChanges: ArrayBuffer;
    moveCount: number;
    firstMove: number;
    layers: Layer[];
    markers: Marker[];
    diagnostics: Diagnostic[];
    bytesRead: number;
    slicer: Slicer;
  }>();
});

test('table row shapes', () => {
  expectTypeOf<Layer>().toEqualTypeOf<{ z: number; firstMove: number }>();
  expectTypeOf<Marker>().toEqualTypeOf<{ name: string; fileOffset: number; moveIndex: number }>();
  expectTypeOf<StateChange>().toEqualTypeOf<{ moveIndex: number; kind: StateKind; index: number; value: number }>();
  expectTypeOf<StateKind>().toEqualTypeOf<
    0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
  >();
  expectTypeOf<Diagnostic>().toEqualTypeOf<{
    code: string;
    severity: 'error' | 'warning' | 'info';
    fileOffset: number;
    message: string;
  }>();
  expectTypeOf<Slicer>().toEqualTypeOf<
    'prusaslicer' | 'superslicer' | 'orcaslicer' | 'bambustudio' | 'cura' | 'unknown'
  >();
});

test('Move shape', () => {
  expectTypeOf<Move>().toEqualTypeOf<{
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    role: MoveRole;
    tool: number;
    flags: number;
    fileOffset: number;
    startTime: number;
  }>();
});

test('parse(source, opts) -> AsyncIterable<Chunk>', () => {
  expectTypeOf<ParseOptions>().toEqualTypeOf<{ signal?: AbortSignal }>();
  expectTypeOf<Parameters<Parse>>().toEqualTypeOf<[source: AsyncIterable<Uint8Array>, opts?: ParseOptions]>();
  expectTypeOf<ReturnType<Parse>>().toEqualTypeOf<AsyncIterable<Chunk>>();
});
