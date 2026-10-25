// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, test } from 'vitest';
import { PROTOCOL_TAG, TRANSPORT_SCHEMA_VERSION, parseEnvelope, type Envelope } from '../src/domain/protocol.ts';

const env = (fields: Record<string, unknown>) => ({ tag: PROTOCOL_TAG, v: TRANSPORT_SCHEMA_VERSION, ...fields });

describe('parseEnvelope', () => {
  test.each<Envelope>([
    env({ kind: 'hello', session: 's1' }) as Envelope,
    env({ kind: 'welcome', session: 's1' }) as Envelope,
    env({ kind: 'request', id: 0, method: 'gcode/load', payload: { bytes: new ArrayBuffer(4) } }) as Envelope,
    env({ kind: 'response', id: 7, ok: true, payload: 42 }) as Envelope,
    env({ kind: 'response', id: 7, ok: false, error: { code: 'not-found', message: 'no file' } }) as Envelope,
    env({ kind: 'notification', method: 'progress' }) as Envelope,
    { tag: PROTOCOL_TAG, v: 99, kind: 'reload', expected: 99 } as unknown as Envelope,
  ])('accepts %o', (message) => {
    expect(parseEnvelope(message)).toEqual({ ok: true, envelope: message });
  });

  test('keeps payloads opaque, including ArrayBuffers, by identity', () => {
    const payload = { bytes: new ArrayBuffer(8) };
    const r = parseEnvelope(env({ kind: 'notification', method: 'chunk', payload }));
    expect(r.ok && r.envelope.kind === 'notification' && r.envelope.payload).toBe(payload);
  });

  test('tolerates extra fields so additive extensions need no version bump', () => {
    expect(parseEnvelope(env({ kind: 'notification', method: 'x', seq: 3 })).ok).toBe(true);
  });

  test.each([null, 'hello', 42, {}, { kind: 'hello', session: 's' }, { tag: 'other', v: 1, kind: 'hello' }])(
    'ignores foreign message %o as not-an-envelope',
    (message) => {
      expect(parseEnvelope(message)).toMatchObject({ ok: false, error: { code: 'not-an-envelope' } });
    },
  );

  test.each([
    env({ kind: 'bogus' }),
    env({ kind: 'hello' }),
    env({ kind: 'hello', session: '' }),
    env({ kind: 'request', id: -1, method: 'm' }),
    env({ kind: 'request', id: 1.5, method: 'm' }),
    env({ kind: 'request', id: 1, method: '' }),
    env({ kind: 'response', id: 1 }),
    env({ kind: 'response', id: 1, ok: false }),
    env({ kind: 'response', id: 1, ok: false, error: { code: 'x' } }),
    env({ kind: 'notification' }),
    { tag: PROTOCOL_TAG, v: '1', kind: 'hello', session: 's' },
    { tag: PROTOCOL_TAG, v: 1, kind: 'reload' },
  ])('rejects malformed %o as invalid-envelope', (message) => {
    expect(parseEnvelope(message)).toMatchObject({ ok: false, error: { code: 'invalid-envelope' } });
  });

  test('an unknown version is a version-mismatch carrying both versions', () => {
    const r = parseEnvelope({ tag: PROTOCOL_TAG, v: TRANSPORT_SCHEMA_VERSION + 1, kind: 'hello', session: 's' });
    expect(r).toMatchObject({
      ok: false,
      error: {
        name: 'VersionMismatchError',
        code: 'version-mismatch',
        expected: TRANSPORT_SCHEMA_VERSION,
        received: TRANSPORT_SCHEMA_VERSION + 1,
      },
    });
  });
});
