// SPDX-License-Identifier: AGPL-3.0-or-later
import { TRANSPORT_SCHEMA_VERSION } from './schema.ts';

export { TRANSPORT_SCHEMA_VERSION };

/** Marks a message as ours, so other traffic on the same postMessage channel is ignored. */
export const PROTOCOL_TAG = 'vsslicer/webview-kit';

interface Base {
  readonly tag: typeof PROTOCOL_TAG;
  readonly v: number;
}
/** Webview to host, first message of every webview load. `session` is fresh per load. */
export interface Hello extends Base {
  readonly kind: 'hello';
  readonly session: string;
}
/** Host to webview, answers a matching `hello`. */
export interface Welcome extends Base {
  readonly kind: 'welcome';
  readonly session: string;
}
/**
 * Either way: "your version is not mine, reload". Like `hello`, its shape is frozen across versions,
 * so it is accepted at any `v`; `expected` is the sender's version.
 */
export interface Reload extends Base {
  readonly kind: 'reload';
  readonly expected: number;
}
export interface Request extends Base {
  readonly kind: 'request';
  /** Non-negative integer, unique per sender and session; the response echoes it. */
  readonly id: number;
  readonly method: string;
  readonly payload?: unknown;
}
export interface RemoteError {
  readonly code: string;
  readonly message: string;
}
export type Response = Base & { readonly kind: 'response'; readonly id: number } & (
    { readonly ok: true; readonly payload?: unknown } | { readonly ok: false; readonly error: RemoteError }
  );
export interface Notification extends Base {
  readonly kind: 'notification';
  readonly method: string;
  readonly payload?: unknown;
}
export type Envelope = Hello | Welcome | Reload | Request | Response | Notification;
export type Kind = Envelope['kind'];

export type ProtocolErrorCode = 'not-an-envelope' | 'invalid-envelope' | 'version-mismatch' | 'timeout';

export class ProtocolError extends Error {
  override readonly name: string = 'ProtocolError';
  readonly code: ProtocolErrorCode;
  constructor(code: ProtocolErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export class VersionMismatchError extends ProtocolError {
  override readonly name = 'VersionMismatchError';
  readonly expected: number;
  readonly received: number;
  constructor(expected: number, received: number) {
    super('version-mismatch', `webview-kit transport version ${received}, expected ${expected}: reload the webview`);
    this.expected = expected;
    this.received = received;
  }
}

/** The peer stayed silent for `ms`: no `welcome`, no acknowledgement, or no next chunk. */
export class TimeoutError extends ProtocolError {
  override readonly name = 'TimeoutError';
  readonly ms: number;
  constructor(what: string, ms: number) {
    super('timeout', `webview-kit: ${what} timed out after ${ms} ms`);
    this.ms = ms;
  }
}

export type ParseResult = { ok: true; envelope: Envelope } | { ok: false; error: ProtocolError };

const isObject = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null;
const isId = (x: unknown) => Number.isSafeInteger(x) && (x as number) >= 0;
const isName = (x: unknown) => typeof x === 'string' && x.length > 0;

/** Per-kind field checks; the payload is never inspected (it may hold ArrayBuffers). */
const fields: Record<Kind, (m: Record<string, unknown>) => boolean> = {
  hello: (m) => isName(m.session),
  welcome: (m) => isName(m.session),
  reload: (m) => Number.isSafeInteger(m.expected),
  request: (m) => isId(m.id) && isName(m.method),
  response: (m) =>
    isId(m.id) &&
    (m.ok === true ||
      (m.ok === false && isObject(m.error) && isName(m.error.code) && typeof m.error.message === 'string')),
  notification: (m) => isName(m.method),
};

/**
 * Validates an incoming message. Unknown extra fields are allowed (an additive change needs no
 * version bump); an unknown `kind` or a changed field is an incompatible change and bumps the version.
 */
export function parseEnvelope(message: unknown, version: number = TRANSPORT_SCHEMA_VERSION): ParseResult {
  if (!isObject(message) || message.tag !== PROTOCOL_TAG)
    return { ok: false, error: new ProtocolError('not-an-envelope', 'not a webview-kit message') };
  const invalid = {
    ok: false,
    error: new ProtocolError('invalid-envelope', `malformed ${String(message.kind)}`),
  } as const;
  if (!Number.isSafeInteger(message.v)) return invalid;
  if (message.kind === 'reload') return fields.reload(message) ? { ok: true, envelope: message as never } : invalid;
  if (message.v !== version) return { ok: false, error: new VersionMismatchError(version, message.v as number) };
  const check = Object.hasOwn(fields, message.kind as string) ? fields[message.kind as Kind] : undefined;
  return check?.(message) ? { ok: true, envelope: message as never } : invalid;
}

const base = { tag: PROTOCOL_TAG, v: TRANSPORT_SCHEMA_VERSION } as const;
export const hello = (session: string): Hello => ({ ...base, kind: 'hello', session });
export const welcome = (session: string): Welcome => ({ ...base, kind: 'welcome', session });
export const reload = (): Reload => ({ ...base, kind: 'reload', expected: TRANSPORT_SCHEMA_VERSION });
