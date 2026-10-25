// SPDX-License-Identifier: AGPL-3.0-or-later
import { PROTOCOL_TAG, TRANSPORT_SCHEMA_VERSION, type Envelope, type Notification } from './protocol.ts';

/**
 * Chunks and acks are `notification`s with reserved methods and extra fields, an additive change to the
 * envelope (no version bump). The chunk's bytes are its `payload`, an ArrayBuffer.
 */
export const CHUNK_METHOD = 'webview-kit/chunk';
export const ACK_METHOD = 'webview-kit/ack';

/** Chunk `seq` (0-based) of `count` in `stream`. A 0-byte buffer is one empty chunk. */
export interface Chunk extends Notification {
  readonly method: typeof CHUNK_METHOD;
  readonly stream: string;
  readonly seq: number;
  readonly count: number;
  readonly payload: ArrayBuffer;
}
/** Cumulative: the receiver holds chunks `0 .. seq-1` of `stream`. */
export interface Ack extends Notification {
  readonly method: typeof ACK_METHOD;
  readonly stream: string;
  readonly seq: number;
}

const base = { tag: PROTOCOL_TAG, v: TRANSPORT_SCHEMA_VERSION, kind: 'notification' } as const;
export const chunk = (stream: string, seq: number, count: number, payload: ArrayBuffer): Chunk => ({
  ...base,
  method: CHUNK_METHOD,
  stream,
  seq,
  count,
  payload,
});
export const ack = (stream: string, seq: number): Ack => ({ ...base, method: ACK_METHOD, stream, seq });

const isStream = (x: unknown): x is string => typeof x === 'string' && x.length > 0;
const isCount = (x: unknown): x is number => Number.isSafeInteger(x) && (x as number) >= 0;

/** Narrows a parsed envelope to a well-formed chunk, or undefined. */
export function asChunk(e: Envelope): Chunk | undefined {
  if (e.kind !== 'notification' || e.method !== CHUNK_METHOD) return undefined;
  const c = e as Partial<Chunk>;
  const ok =
    isStream(c.stream) &&
    isCount(c.count) &&
    c.count > 0 &&
    isCount(c.seq) &&
    c.seq < c.count &&
    c.payload instanceof ArrayBuffer;
  return ok ? (c as Chunk) : undefined;
}

/** Narrows a parsed envelope to a well-formed ack, or undefined. */
export function asAck(e: Envelope): Ack | undefined {
  if (e.kind !== 'notification' || e.method !== ACK_METHOD) return undefined;
  const a = e as Partial<Ack>;
  return isStream(a.stream) && isCount(a.seq) ? (a as Ack) : undefined;
}
