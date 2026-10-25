// SPDX-License-Identifier: AGPL-3.0-or-later
import { ack, asAck, asChunk, chunk } from '../domain/chunk.ts';
import {
  ProtocolError,
  TRANSPORT_SCHEMA_VERSION,
  TimeoutError,
  VersionMismatchError,
  parseEnvelope,
} from '../domain/protocol.ts';
import type { Channel } from './channel.ts';

export interface TransferOptions {
  /** Bytes per chunk. Default 1 MiB. */
  readonly chunkSize?: number;
  /** Most chunks sent but not yet acknowledged. Default 4. */
  readonly window?: number;
  /** Longest silence, in ms, before the transfer fails with TimeoutError. Default 30 s. */
  readonly timeoutMs?: number;
}
// shortcut: defaults are guesses; tune them from the postMessage throughput spike when it lands.
export const TRANSFER_DEFAULTS = { chunkSize: 1 << 20, window: 4, timeoutMs: 30_000 } as const;

const positive = (name: string, x: number) => {
  if (!Number.isSafeInteger(x) || x <= 0) throw new RangeError(`${name} must be a positive integer, got ${x}`);
  return x;
};

/**
 * Sends `data` as `stream` (unique per sender) in chunks, keeping at most `window` of them unacknowledged.
 * Resolves when the receiver has acknowledged every chunk. Rejects with TimeoutError when no acknowledgement
 * arrives for `timeoutMs`, and with VersionMismatchError when the peer reloads onto another version.
 */
export function sendBuffer(
  channel: Channel,
  stream: string,
  data: ArrayBuffer | Uint8Array,
  options: TransferOptions = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    const o = { ...TRANSFER_DEFAULTS, ...options };
    const size = positive('chunkSize', o.chunkSize);
    const window = positive('window', o.window);
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    const count = Math.max(1, Math.ceil(bytes.byteLength / size));
    let sent = 0;
    let acked = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const finish = (error?: Error) => {
      stop();
      clearTimeout(timer);
      if (error) reject(error);
      else resolve();
    };
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => finish(new TimeoutError(`transfer "${stream}"`, o.timeoutMs)), o.timeoutMs);
    };
    const pump = () => {
      for (; sent < count && sent - acked < window; sent++) {
        // slice copies, so each chunk owns a buffer of exactly its bytes and can be transferred.
        const part = bytes.slice(sent * size, (sent + 1) * size).buffer as ArrayBuffer;
        channel.post(chunk(stream, sent, count, part));
      }
    };
    const stop = channel.onMessage((message) => {
      const r = parseEnvelope(message);
      if (!r.ok) {
        if (r.error instanceof VersionMismatchError) finish(r.error);
        return;
      }
      if (r.envelope.kind === 'reload')
        return finish(new VersionMismatchError(TRANSPORT_SCHEMA_VERSION, r.envelope.expected));
      const a = asAck(r.envelope);
      if (a?.stream !== stream || a.seq <= acked) return;
      acked = Math.min(a.seq, sent);
      if (acked === count) return finish();
      arm();
      pump();
    });
    arm();
    pump();
  });
}

export interface ReceiveHandlers {
  /** Every chunk of `stream` arrived; `data` is the reassembled bytes. */
  onBuffer(stream: string, data: ArrayBuffer): void;
  /** `stream` failed (TimeoutError, or a ProtocolError for inconsistent chunks) and was dropped. */
  onError(stream: string, error: ProtocolError): void;
}

const CLOSED_MAX = 256;

interface Incoming {
  readonly count: number;
  readonly parts: (ArrayBuffer | undefined)[];
  contiguous: number;
  timer?: ReturnType<typeof setTimeout>;
}

/**
 * Receives every stream on `channel`: buffers chunks by `seq` (any arrival order, duplicates ignored), acks
 * cumulatively after each one, and reports each stream once, complete or failed. Returns the unsubscribe
 * function, which also drops unfinished streams. Messages from another version are ignored here; the
 * handshake owns version mismatch.
 * shortcut: no cap on a stream's declared size; add one if a peer is ever untrusted beyond our own webview.
 */
export function receiveBuffers(
  channel: Channel,
  handlers: ReceiveHandlers,
  options: Pick<TransferOptions, 'timeoutMs'> = {},
): () => void {
  const timeoutMs = options.timeoutMs ?? TRANSFER_DEFAULTS.timeoutMs;
  const streams = new Map<string, Incoming>();
  // Ids of finished or failed streams, so late duplicate chunks cannot reopen them.
  // shortcut: bounded FIFO; a duplicate arriving after CLOSED_MAX newer streams closed would reopen its stream.
  const closed = new Set<string>();
  const close = (stream: string) => {
    closed.add(stream);
    if (closed.size > CLOSED_MAX) closed.delete(closed.values().next().value!);
  };
  const drop = (stream: string) => {
    clearTimeout(streams.get(stream)?.timer);
    streams.delete(stream);
  };
  const fail = (stream: string, error: ProtocolError) => {
    drop(stream);
    close(stream);
    handlers.onError(stream, error);
  };

  const stop = channel.onMessage((message) => {
    const r = parseEnvelope(message);
    const c = r.ok ? asChunk(r.envelope) : undefined;
    if (!c || closed.has(c.stream)) return;
    let s = streams.get(c.stream);
    if (!s) streams.set(c.stream, (s = { count: c.count, parts: [], contiguous: 0 }));
    if (c.count !== s.count)
      return fail(c.stream, new ProtocolError('invalid-envelope', `chunk count changed in "${c.stream}"`));
    s.parts[c.seq] ??= c.payload;
    while (s.parts[s.contiguous]) s.contiguous++;
    channel.post(ack(c.stream, s.contiguous));
    if (s.contiguous === s.count) {
      drop(c.stream);
      close(c.stream);
      return handlers.onBuffer(c.stream, concat(s.parts as ArrayBuffer[]));
    }
    clearTimeout(s.timer);
    s.timer = setTimeout(() => fail(c.stream, new TimeoutError(`stream "${c.stream}"`, timeoutMs)), timeoutMs);
  });
  return () => {
    stop();
    for (const stream of [...streams.keys()]) drop(stream);
  };
}

function concat(parts: ArrayBuffer[]): ArrayBuffer {
  if (parts.length === 1) return parts[0]!;
  const out = new Uint8Array(parts.reduce((n, p) => n + p.byteLength, 0));
  let at = 0;
  for (const p of parts) {
    out.set(new Uint8Array(p), at);
    at += p.byteLength;
  }
  return out.buffer;
}
