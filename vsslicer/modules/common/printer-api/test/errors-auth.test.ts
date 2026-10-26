// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, test } from 'vitest';
import {
  AUTH_SCHEMES,
  AUTH_SCHEME_IDS,
  PRINTER_ERROR_KINDS,
  PrinterError,
  isPrinterError,
} from '../src/domain/index.ts';

describe('PrinterError', () => {
  test('lists exactly the eight kinds', () => {
    expect([...PRINTER_ERROR_KINDS]).toEqual([
      'auth',
      'unreachable',
      'timeout',
      'refused',
      'busy',
      'unsupported',
      'protocol',
      'fileRejected',
    ]);
  });

  test.each(PRINTER_ERROR_KINDS)('%s keeps kind, message and cause', (kind) => {
    const cause = new Error('boom');
    const e = new PrinterError(kind, 'msg', cause);
    expect(e).toBeInstanceOf(Error);
    expect(e.kind).toBe(kind);
    expect(e.name).toBe('PrinterError');
    expect(e.message).toBe('msg');
    expect(e.cause).toBe(cause);
    expect(isPrinterError(e, kind)).toBe(true);
    expect(isPrinterError(e, kind === 'auth' ? 'busy' : 'auth')).toBe(false);
  });

  test('cause is optional and absent; non-errors are not PrinterErrors', () => {
    expect('cause' in new PrinterError('busy', 'x')).toBe(false);
    expect(isPrinterError(new Error('x'))).toBe(false);
    expect(isPrinterError({ kind: 'auth' })).toBe(false);
  });
});

describe('auth schemes', () => {
  test('declares the seven schemes, each keyed by its own id', () => {
    expect([...AUTH_SCHEME_IDS]).toEqual(['apikey', 'digest', 'session', 'bearer', 'token', 'pairing', 'accessCode']);
    for (const id of AUTH_SCHEME_IDS) expect(AUTH_SCHEMES[id].id).toBe(id);
  });

  test('every field has a label, unique name and a secret flag; passwords and tokens are secret', () => {
    for (const s of Object.values(AUTH_SCHEMES)) {
      const names = s.fields.map((f) => f.name);
      expect(new Set(names).size).toBe(names.length);
      for (const f of s.fields) {
        expect(f.label.length).toBeGreaterThan(0);
        expect(typeof f.secret).toBe('boolean');
      }
    }
    expect(AUTH_SCHEMES.digest.fields.find((f) => f.name === 'password')?.secret).toBe(true);
    expect(AUTH_SCHEMES.digest.fields.find((f) => f.name === 'username')?.secret).toBe(false);
    expect(AUTH_SCHEMES.pairing.fields).toEqual([]);
    expect(AUTH_SCHEMES.accessCode.fields[0]?.secret).toBe(true);
  });
});
