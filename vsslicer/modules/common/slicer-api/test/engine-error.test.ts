// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from 'vitest';
import { classifyExitCode, describeEngineError, type EngineError } from '../src/domain/engine-error.ts';

const all: EngineError[] = [
  { code: 'not-installed', engine: 'orca' },
  { code: 'unsupported-version', engine: 'orca', found: '1.0', required: '2.x' },
  { code: 'unknown-exit-code', engine: 'orca', exitCode: 77 },
  { code: 'exit-code', engine: 'orca', exitCode: 156, name: 'CLI_SLICING_ERROR' },
  { code: 'crash', engine: 'orca', signal: 'SIGSEGV' },
  { code: 'timeout', engine: 'orca', seconds: 60 },
  { code: 'cancelled', engine: 'orca' },
  { code: 'empty-output', engine: 'orca' },
  { code: 'missing-plate-output', engine: 'orca', plate: 2 },
  { code: 'bad-input', engine: 'orca', reason: 'no objects' },
  { code: 'checksum-mismatch', engine: 'orca', expected: 'a', actual: 'b' },
  { code: 'offline', engine: 'orca' },
  { code: 'http', engine: 'orca', status: 404 },
];

test('every variant has distinct non-empty message and remediation', () => {
  expect(new Set(all.map((e) => e.code)).size).toBe(13);
  const texts = all.map(describeEngineError);
  for (const [i, x] of texts.entries()) {
    expect(x.code).toBe(all[i]!.code);
    expect(x.message.length).toBeGreaterThan(0);
    expect(x.remediation.length).toBeGreaterThan(0);
  }
  expect(new Set(texts.map((x) => x.message)).size).toBe(13);
  expect(new Set(texts.map((x) => x.remediation)).size).toBe(13);
});

test('errors survive JSON and messages carry no stack', () => {
  for (const e of all) {
    expect(JSON.parse(JSON.stringify(e))).toEqual(e);
    expect(JSON.stringify(describeEngineError(e))).not.toMatch(/\n\s+at /);
  }
});

test('exit codes: 0 is success, wrapped codes are named, unknown stays unknown', () => {
  const named = { [-100]: 'CLI_SLICING_ERROR' };
  expect(classifyExitCode('orca', 0, named)).toBeUndefined();
  expect(classifyExitCode('orca', 156, named)).toEqual({
    code: 'exit-code',
    engine: 'orca',
    exitCode: 156,
    name: 'CLI_SLICING_ERROR',
  });
  expect(classifyExitCode('orca', 77, named)).toEqual({ code: 'unknown-exit-code', engine: 'orca', exitCode: 77 });
  // regression: 256 wraps to 0 modulo 256 but is not success
  expect(classifyExitCode('orca', 256, named)?.code).toBe('unknown-exit-code');
  expect(classifyExitCode('orca', 1, { 1: 'constructor' })?.code).toBe('exit-code');
  expect(classifyExitCode('orca', 5, {})?.code).toBe('unknown-exit-code');
});
