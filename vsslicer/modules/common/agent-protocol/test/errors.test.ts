// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from 'vitest';
import { AgentError, ERROR_TABLE, MAX_MESSAGE_LENGTH } from '../src/domain/errors.ts';

test('pins the code and kind table', () => {
  expect(ERROR_TABLE).toEqual({
    ParseError: { code: -32700, kind: 'parse_error' },
    InvalidRequest: { code: -32600, kind: 'invalid_request' },
    MethodNotFound: { code: -32601, kind: 'method_not_found' },
    InvalidParams: { code: -32602, kind: 'invalid_params' },
    InternalError: { code: -32603, kind: 'internal_error' },
    Unauthorized: { code: -32001, kind: 'unauthorized' },
    NotFound: { code: -32002, kind: 'not_found' },
    Busy: { code: -32003, kind: 'busy' },
    Timeout: { code: -32004, kind: 'timeout' },
    AdapterError: { code: -32005, kind: 'adapter_error' },
    Cancelled: { code: -32006, kind: 'cancelled' },
    AgentVersionMismatch: { code: -32007, kind: 'agent_version_mismatch' },
  });
});

test('codes and kinds are unique, application codes in -32000..-32099', () => {
  const all = Object.values(ERROR_TABLE);
  expect(new Set(all.map((e) => e.code)).size).toBe(all.length);
  expect(new Set(all.map((e) => e.kind)).size).toBe(all.length);
  for (const e of all.filter((x) => x.code > -32600)) {
    expect(e.code).toBeLessThanOrEqual(-32000);
    expect(e.code).toBeGreaterThanOrEqual(-32099);
  }
});

test('round-trips losslessly through JSON', () => {
  for (const data of [undefined, {}, { retryAfterMs: 5, nested: { a: [1] } }]) {
    const e = AgentError.of('Busy', 'printer busy', data);
    const back = AgentError.fromJSON(JSON.parse(JSON.stringify(e)));
    expect(back.code).toBe(e.code);
    expect(back.kind).toBe(e.kind);
    expect(back.message).toBe(e.message);
    expect(back.data).toEqual(data && Object.keys(data).length ? data : undefined);
  }
});

test('keeps unknown codes and falls back to the table when kind is absent', () => {
  const unknown = AgentError.fromJSON({ code: -32099, message: 'x', data: { kind: 'future' } });
  expect([unknown.code, unknown.kind]).toEqual([-32099, 'future']);
  expect(AgentError.fromJSON({ code: -32601, message: 'm' }).kind).toBe('method_not_found');
  expect(AgentError.fromJSON({ code: 7, message: 'm' }).kind).toBe('unknown');
});

test('fromJSON turns malformed input into internal_error instead of throwing', () => {
  for (const bad of [
    null,
    undefined,
    'x',
    5,
    [],
    [1],
    { message: 'm' },
    { code: 1.5, message: 'm' },
    { code: 'a', message: 'm' },
    { code: 1 },
    { code: 1, message: {} },
  ]) {
    const e = AgentError.fromJSON(bad);
    expect([e.code, e.kind]).toEqual([-32603, 'internal_error']);
    expect(e.message).toMatch(/^malformed wire error/);
  }
});

test('fromJSON drops non-object data and does not spread strings or arrays', () => {
  for (const data of ['ab', 7, [1, 2], null, true]) {
    expect(AgentError.fromJSON({ code: -32001, message: 'm', data }).data).toBeUndefined();
  }
  const hostile = AgentError.fromJSON(
    JSON.parse('{"code":-32001,"message":"m","data":{"__proto__":{"x":1},"constructor":2}}'),
  );
  expect(({} as Record<string, unknown>).x).toBeUndefined();
  expect(Object.keys(hostile.data ?? {})).toEqual(['__proto__', 'constructor']);
});

test("a caller's data.kind is rejected at construction, so round trips stay lossless", () => {
  expect(() => AgentError.of('Busy', 'm', { kind: 'mine' })).toThrow(RangeError);
  const e = AgentError.of('Busy', 'm', { k: 1 });
  expect(AgentError.fromJSON(e.toJSON()).toJSON()).toEqual(e.toJSON());
});

test('caps oversize messages with a marker, on construction and from the wire', () => {
  const huge = 'a'.repeat(5_000_000);
  for (const e of [AgentError.of('Busy', huge), AgentError.fromJSON({ code: -32003, message: huge })]) {
    expect(e.message.length).toBe(MAX_MESSAGE_LENGTH);
    expect(e.message.endsWith('[truncated]')).toBe(true);
  }
  expect(AgentError.of('Busy', 'a'.repeat(MAX_MESSAGE_LENGTH)).message.length).toBe(MAX_MESSAGE_LENGTH);
});
