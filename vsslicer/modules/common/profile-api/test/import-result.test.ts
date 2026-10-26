// SPDX-License-Identifier: AGPL-3.0-or-later
// Checked by `tsc -p tsconfig.test.json` (part of `pnpm test`): a field dropped, made optional or retyped fails to compile.
import { expectTypeOf, test } from 'vitest';
import type { Diagnostic, DiagnosticCode, ImportResult, InstanceImport } from '../src/domain/import-result/index.ts';
import type { PrinterInstance } from '../src/index.ts';

test('Diagnostic carries severity, code, file, optional line and message', () => {
  expectTypeOf<keyof Diagnostic>().toEqualTypeOf<'severity' | 'code' | 'file' | 'line' | 'message'>();
  expectTypeOf<Diagnostic['severity']>().toEqualTypeOf<'error' | 'warning' | 'info'>();
  expectTypeOf<Diagnostic['file']>().toEqualTypeOf<string>();
  expectTypeOf<Diagnostic['line']>().toEqualTypeOf<number | undefined>();
  expectTypeOf<Diagnostic['message']>().toEqualTypeOf<string>();
});

test('the diagnostic codes are a closed union', () => {
  expectTypeOf<DiagnosticCode>().toEqualTypeOf<
    | 'cycle'
    | 'unknown-parent'
    | 'malformed-line'
    | 'invalid-json'
    | 'unknown-type'
    | 'unreadable-folder'
    | 'credential-missing'
  >();
});

test('ImportResult has entities, native and diagnostics, all required', () => {
  expectTypeOf<keyof ImportResult>().toEqualTypeOf<'entities' | 'native' | 'diagnostics'>();
  expectTypeOf<ImportResult['diagnostics']>().toEqualTypeOf<Diagnostic[]>();
  expectTypeOf<ImportResult['native']>().toEqualTypeOf<Record<string, unknown>>();
  expectTypeOf<PrinterInstance>().toExtend<ImportResult['entities'][number]>();
});

test('InstanceImport keeps the credential outside the entity', () => {
  expectTypeOf<keyof InstanceImport>().toEqualTypeOf<'entity' | 'credential'>();
  expectTypeOf<InstanceImport['entity']>().toEqualTypeOf<PrinterInstance>();
  expectTypeOf<InstanceImport['credential']>().toEqualTypeOf<string | undefined>();
  expectTypeOf<'credential'>().not.toExtend<keyof PrinterInstance>();
});
