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
import { plannerFor, ToolheadWindow } from '@vsslicer/gcode-planner';
import { fileKind } from '../domain/file-kind.ts';
import {
  Method,
  moveStream,
  summarise,
  type PlateRequest,
  type Progress,
  type Received,
  windowStream,
  type TimelineCommand,
  type ViewState,
  type WindowRequest,
} from '../domain/summary.ts';
import { packWindow } from '../domain/window.ts';
import { resolvePosition, type PrintPosition, type Revealed } from '../domain/print-position.ts';
import { readTextWindow, type ReadAt } from './read-text.ts';
import type { Loaded } from './load-preview.ts';

/** Parses and plans `path` off the calling thread (the worker adapter). Rejects with an Error that may carry a `code`. */
export type LoadPort = (
  path: string,
  kind: 'gcode' | 'bgcode' | 'gcode.3mf',
  signal: AbortSignal,
  /** Plate of a `.gcode.3mf` (default: the first). */
  plate?: number,
) => Promise<Loaded>;

export interface ServeHandlers {
  /** The webview reported every move buffer of a `ready` state as received. */
  onReceived?(received: Received): void;
  /** The timeline of the webview changed state or advanced. */
  onProgress?(progress: Progress): void;
  /** The webview runs another transport version: set its HTML again from the current build. */
  onMismatch(): void;
}

export interface PreviewSession {
  /** Settles with the final state of the current load (never rejects); a retry replaces it. */
  readonly state: Promise<ViewState>;
  /** Serves one webview for its lifetime: answers each handshake with the state and the buffers. Returns the unsubscribe. */
  serve(channel: Channel, handlers: ServeHandlers): () => void;
  /** Tells the webview on `channel` to drive its timeline. */
  command(channel: Channel, command: TimelineCommand): void;
  /** Loads again after an error and resolves with the new state; any other state is returned as is. */
  retry(): Promise<ViewState>;
  /** Loads another plate of a `.gcode.3mf` and resolves with the new state; a plate the file does not list is ignored. */
  setPlate(plate: number): Promise<ViewState>;
  /**
   * Waits for the load, resolves `position` (validated by the caller) to a move and seeks every served webview there.
   * Rejects when the file did not load or the position is outside it (a layer past the last).
   */
  reveal(position: PrintPosition): Promise<Revealed>;
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

/** `readAt` reads the file itself, for the text pane; only plain `.gcode` has one (other kinds' offsets are not file offsets). */
export const openPreview = (path: string, load: LoadPort, readAt?: ReadAt): PreviewSession => {
  const abort = new AbortController();
  const kind = fileKind(path);
  // The parse stays here so a reloaded webview can be served again and can ask for toolhead windows.
  let loaded: Loaded | undefined;
  let generation = 0;
  let running: AbortController | undefined;
  let chosen: number | undefined;
  // the last revealed move: a webview served after the reveal (or still receiving its buffers) seeks there once its moves are in
  let revealed: number | undefined;
  const served = new Set<Channel>();
  const start = (plate?: number): Promise<ViewState> => {
    if (!kind) return Promise.resolve({ status: 'unsupported', message: `Not a G-code file: ${path}` });
    const mine = ++generation;
    chosen = plate;
    revealed = undefined; // a move of another plate or parse means nothing here
    // each load has its own controller, so a superseded one (and its worker) is stopped, not left running
    running?.abort(new Error('superseded by another plate'));
    const own = (running = new AbortController());
    abort.signal.addEventListener('abort', () => own.abort(abort.signal.reason), { once: true });
    return load(path, kind, own.signal, plate).then((l) => {
      // a slower, superseded load must not replace the parse of the plate now shown
      if (mine === generation) loaded = l;
      return { status: 'ready', summary: summarise(kind, l.parsed, l.timing, l) };
    }, failure);
  };
  let state = start();

  const deliver = async (channel: Channel, session: string): Promise<void> => {
    channel.post(notify(Method.state, { status: 'loading' } satisfies ViewState));
    const s = await state;
    channel.post(notify(Method.state, s));
    if (s.status !== 'ready') return;
    for (const [i, b] of (loaded?.parsed.moves ?? []).entries()) await sendBuffer(channel, moveStream(session, i), b);
    // a seek posted before the buffers lands on an empty timeline (move 0), so it is posted again after the last one
    if (revealed !== undefined) self.command(channel, { action: 'seek', move: revealed });
  };

  const sendWindow = async (channel: Channel, session: string, { seq, from, to }: WindowRequest) => {
    if (!loaded) return;
    const { parsed, timing } = loaded;
    // the planner is stateless (checkpoints hold the state), so it is made again here, not kept from the worker
    const w = new ToolheadWindow(plannerFor(parsed, timing.limits), parsed, timing, from, to);
    await sendBuffer(channel, windowStream(session, seq), packWindow(w));
  };

  const self: PreviewSession = {
    get state() {
      return state;
    },
    async retry() {
      const failed = state;
      if ((await failed).status === 'error' && state === failed && !abort.signal.aborted) state = start(chosen);
      return state;
    },
    setPlate(plate) {
      const shown = loaded?.plates;
      if (!shown?.numbers.includes(plate) || abort.signal.aborted) return state;
      return (state = start(plate));
    },
    serve(channel, { onReceived, onProgress, onMismatch }) {
      let current = '';
      served.add(channel);
      // one text read in flight; later requests replace the one waiting (the webview ignores stale seqs)
      let reading = false;
      let waiting: { payload: unknown } | undefined;
      const readText = (payload: unknown): void => {
        reading = true;
        void readTextWindow(readAt!, payload)
          .then((w) => w && channel.post(notify(Method.textWindow, w)))
          .catch(() => {}) // an invalid request or a read error (file gone) is dropped: the pane keeps what it showed
          .then(() => {
            reading = false;
            const next = waiting;
            waiting = undefined;
            if (next) readText(next.payload);
          });
      };
      const stops = [
        serveHandshake(channel, {
          // a send cut short by a reload or a closed editor is superseded by the next handshake, or by nothing
          onReady: (session) => void deliver(channel, (current = session)).catch(() => {}),
          onMismatch,
        }),
        channel.onMessage((m) => {
          const r = parseEnvelope(m);
          if (r.ok && r.envelope.kind === 'notification' && r.envelope.method === Method.received)
            onReceived?.(r.envelope.payload as Received);
          else if (r.ok && r.envelope.kind === 'notification' && r.envelope.method === Method.retry && current)
            void self
              .retry()
              .then(() => deliver(channel, current))
              .catch(() => {});
          else if (r.ok && r.envelope.kind === 'notification' && r.envelope.method === Method.plate && current) {
            // `loading` goes out before the load is awaited; a superseded load delivers nothing
            channel.post(notify(Method.state, { status: 'loading' } satisfies ViewState));
            const p = self.setPlate((r.envelope.payload as PlateRequest).plate);
            void p.then(() => (self.state === p ? deliver(channel, current) : undefined)).catch(() => {});
          } else if (r.ok && r.envelope.kind === 'notification' && r.envelope.method === Method.window && current)
            // a bad range (the file changed under a stale webview) or a closed panel is dropped: the marker falls back
            void sendWindow(channel, current, r.envelope.payload as WindowRequest).catch(() => {});
          else if (r.ok && r.envelope.kind === 'notification' && r.envelope.method === Method.text && readAt) {
            if (reading) waiting = { payload: r.envelope.payload };
            else readText(r.envelope.payload);
          } else if (r.ok && r.envelope.kind === 'notification' && r.envelope.method === Method.progress)
            onProgress?.(r.envelope.payload as Progress);
        }),
      ];
      return () => (served.delete(channel), stops.forEach((stop) => stop()));
    },
    async reveal(position) {
      const s = await state;
      if (s.status !== 'ready' || !loaded) throw new Error(`nothing to reveal: the preview is ${s.status}`);
      const { parsed, timing } = loaded;
      const r = resolvePosition({ ...parsed, totalTime: timing.totalTime }, position);
      revealed = r.move;
      for (const channel of served) self.command(channel, { action: 'seek', move: r.move });
      return r;
    },
    command: (channel, command) => channel.post(notify(Method.command, command)),
    dispose() {
      abort.abort();
      loaded = undefined;
    },
  };
  return self;
};
