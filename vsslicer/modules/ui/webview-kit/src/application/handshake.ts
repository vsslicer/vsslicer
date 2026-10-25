// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  TRANSPORT_SCHEMA_VERSION,
  TimeoutError,
  VersionMismatchError,
  hello,
  parseEnvelope,
  reload,
  welcome,
  type Welcome,
} from '../domain/protocol.ts';
import type { Channel } from './channel.ts';

export interface HandshakeHandlers {
  /** A webview load completed the handshake; called again after every reload, with a new session. */
  onReady(session: string): void;
  /** Versions differ: the host should reload the webview (set `webview.html` again from the current build). */
  onMismatch(error: VersionMismatchError): void;
}

/** Host side: answers every `hello` for as long as the panel lives. Returns the unsubscribe function. */
export function serveHandshake(channel: Channel, handlers: HandshakeHandlers): () => void {
  return channel.onMessage((message) => {
    const r = parseEnvelope(message);
    if (r.ok && r.envelope.kind === 'hello') {
      channel.post(welcome(r.envelope.session));
      handlers.onReady(r.envelope.session);
    } else if (r.ok && r.envelope.kind === 'reload') {
      handlers.onMismatch(new VersionMismatchError(TRANSPORT_SCHEMA_VERSION, r.envelope.expected));
    } else if (!r.ok && r.error instanceof VersionMismatchError) {
      channel.post(reload());
      handlers.onMismatch(r.error);
    }
  });
}

/**
 * Webview side: run once per document load. Resolves on the host's `welcome` for this session;
 * rejects with VersionMismatchError when either side is on another schema version, and with TimeoutError
 * when no answer comes within `timeoutMs` (default 30 s).
 * shortcut: no hello retry, so the host must subscribe before setting `html`.
 */
export function handshake(
  channel: Channel,
  session: string = crypto.randomUUID(),
  { timeoutMs = 30_000 }: { readonly timeoutMs?: number } = {},
): Promise<Welcome> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      stop();
      reject(new TimeoutError('handshake', timeoutMs));
    }, timeoutMs);
    const settle = () => (stop(), clearTimeout(timer));
    const stop = channel.onMessage((message) => {
      const r = parseEnvelope(message);
      if (r.ok && r.envelope.kind === 'welcome' && r.envelope.session === session) {
        settle();
        resolve(r.envelope);
      } else if (r.ok && r.envelope.kind === 'reload') {
        settle();
        reject(new VersionMismatchError(r.envelope.expected, TRANSPORT_SCHEMA_VERSION));
      } else if (!r.ok && r.error instanceof VersionMismatchError) {
        settle();
        channel.post(reload());
        reject(r.error);
      }
    });
    channel.post(hello(session));
  });
}
