// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Error table. Standard JSON-RPC 2.0 codes, plus application codes in the
 * implementation-defined server-error range -32000..-32099. Codes and kinds are
 * wire-stable: never renumber or rename, only append.
 */
export const ERROR_TABLE = {
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
} as const;

export type ErrorName = keyof typeof ERROR_TABLE;
export type ErrorCode = (typeof ERROR_TABLE)[ErrorName]['code'];
export type ErrorKind = (typeof ERROR_TABLE)[ErrorName]['kind'];

/** Wire form of a JSON-RPC error; `data.kind` carries the stable kind. */
export interface WireError {
  code: number;
  message: string;
  data?: { kind: string; [key: string]: unknown };
}

const entries = Object.values(ERROR_TABLE);

/**
 * Longest message kept, in UTF-16 units; longer ones are cut and end with the marker.
 * Data is not capped here: the transport caps the frame size, which bounds the whole error.
 */
export const MAX_MESSAGE_LENGTH = 4096;
const TRUNCATION_MARKER = '…[truncated]';

const isPlainObject = (v: unknown): v is Record<string, unknown> => {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
};

export class AgentError extends Error {
  readonly code: number;
  readonly kind: string;
  /** Extra detail beyond `kind`; kept as a plain object so it round-trips. */
  readonly data?: Record<string, unknown>;

  constructor(code: number, kind: string, message: string, data?: Record<string, unknown>) {
    super(
      message.length > MAX_MESSAGE_LENGTH
        ? message.slice(0, MAX_MESSAGE_LENGTH - TRUNCATION_MARKER.length) + TRUNCATION_MARKER
        : message,
    );
    // `kind` is reserved: the wire puts the stable kind at data.kind, so a caller's own key would be overwritten.
    if (data !== undefined && 'kind' in data)
      throw new RangeError("AgentError data must not contain the reserved key 'kind'");
    this.name = 'AgentError';
    this.code = code;
    this.kind = kind;
    if (data !== undefined) this.data = data;
  }

  static of(name: ErrorName, message: string, data?: Record<string, unknown>): AgentError {
    const { code, kind } = ERROR_TABLE[name];
    return new AgentError(code, kind, message, data);
  }

  toJSON(): WireError {
    return { code: this.code, message: this.message, data: { ...this.data, kind: this.kind } };
  }

  /**
   * Reads a wire error from untrusted input. Unknown code/kind pairs are kept as received so a
   * newer peer's errors survive; a missing kind falls back to the table by code, else 'unknown'.
   * Malformed input (not an object, non-integer code, non-string message) never throws: it yields
   * an `internal_error` describing the problem. A `data` that is not a plain object is dropped.
   */
  static fromJSON(w: unknown): AgentError {
    if (!isPlainObject(w)) return AgentError.of('InternalError', 'malformed wire error: not an object');
    if (!Number.isInteger(w.code))
      return AgentError.of('InternalError', 'malformed wire error: code is not an integer');
    if (typeof w.message !== 'string')
      return AgentError.of('InternalError', 'malformed wire error: message is not a string');
    const code = w.code as number;
    const { kind: wireKind, ...data } = isPlainObject(w.data) ? w.data : ({} as Record<string, unknown>);
    const kind = typeof wireKind === 'string' ? wireKind : (entries.find((e) => e.code === code)?.kind ?? 'unknown');
    return new AgentError(code, kind, w.message, Object.keys(data).length ? data : undefined);
  }
}
