// SPDX-License-Identifier: AGPL-3.0-or-later
// Host side of one opened file: load it off-thread once, then hand the state and the move buffers to every webview load.
import {
  PROTOCOL_TAG,
  TRANSPORT_SCHEMA_VERSION,
  parseEnvelope,
  sendBuffer,
  serveHandshake,
  type Channel,
} from '@vsslicer/webview-kit/host';
import { fileKind } from '../domain/file-kind.ts';
import {
  Method,
  moveStream,
  summarise,
  type Progress,
  type Received,
  type TimelineCommand,
  type ViewState,
} from '../domain/summary.ts';
import type { Loaded } from './load-preview.ts';

/** Parses and plans `path` off the calling thread (the worker adapter). Rejects with an Error that may carry a `code`. */
export type LoadPort = (path: string, kind: 'gcode' | 'bgcode', signal: AbortSignal) => Promise<Loaded>;

export const UNSUPPORTED_3MF =
  'Previewing .gcode.3mf files is not supported yet; it is planned for a later release. Use "Open With..." to pick another editor.';

export interface ServeHandlers {
  /** The webview reported every move buffer of a `ready` state as received. */
  onReceived?(received: Received): void;
  /** The timeline of the webview changed state or advanced. */
  onProgress?(progress: Progress): void;
  /** The webview runs another transport version: set its HTML again from the current build. */
  onMismatch(): void;
}

export interface PreviewSession {
  /** Settles once with the final state (never rejects). */
  readonly state: Promise<ViewState>;
  /** Serves one webview for its lifetime: answers each handshake with the state and the buffers. Returns the unsubscribe. */
  serve(channel: Channel, handlers: ServeHandlers): () => void;
  /** Tells the webview on `channel` to drive its timeline. */
  command(channel: Channel, command: TimelineCommand): void;
  /** Stops a running load (terminates the worker) and drops the buffers. */
  dispose(): void;
}

const notify = (method: string, payload: unknown) => ({
  tag: PROTOCOL_TAG,
  v: TRANSPORT_SCHEMA_VERSION,
  kind: 'notification' as const,
  method,
  payload,
});

const failure = (e: unknown): ViewState => ({
  status: 'error',
  code: String((e as { code?: unknown }).code ?? 'load-failed'),
  message: e instanceof Error ? e.message : String(e),
});

export const openPreview = (path: string, load: LoadPort): PreviewSession => {
  const abort = new AbortController();
  const kind = fileKind(path);
  // The move buffers stay here so a reloaded webview can be served again; everything else of the parse is dropped.
  let buffers: ArrayBuffer[] = [];
  const state: Promise<ViewState> =
    kind === 'gcode' || kind === 'bgcode'
      ? load(path, kind, abort.signal).then(({ parsed, timing }) => {
          buffers = parsed.moves;
          return { status: 'ready', summary: summarise(kind, parsed, timing) };
        }, failure)
      : Promise.resolve({
          status: 'unsupported',
          message: kind === 'gcode.3mf' ? UNSUPPORTED_3MF : `Not a G-code file: ${path}`,
        });

  const deliver = async (channel: Channel, session: string): Promise<void> => {
    channel.post(notify(Method.state, { status: 'loading' } satisfies ViewState));
    const s = await state;
    channel.post(notify(Method.state, s));
    if (s.status === 'ready')
      for (const [i, b] of buffers.entries()) await sendBuffer(channel, moveStream(session, i), b);
  };

  return {
    state,
    serve(channel, { onReceived, onProgress, onMismatch }) {
      const stops = [
        serveHandshake(channel, {
          // a send cut short by a reload or a closed editor is superseded by the next handshake, or by nothing
          onReady: (session) => void deliver(channel, session).catch(() => {}),
          onMismatch,
        }),
        channel.onMessage((m) => {
          const r = parseEnvelope(m);
          if (r.ok && r.envelope.kind === 'notification' && r.envelope.method === Method.received)
            onReceived?.(r.envelope.payload as Received);
          else if (r.ok && r.envelope.kind === 'notification' && r.envelope.method === Method.progress)
            onProgress?.(r.envelope.payload as Progress);
        }),
      ];
      return () => stops.forEach((stop) => stop());
    },
    command: (channel, command) => channel.post(notify(Method.command, command)),
    dispose() {
      abort.abort();
      buffers = [];
    },
  };
};
