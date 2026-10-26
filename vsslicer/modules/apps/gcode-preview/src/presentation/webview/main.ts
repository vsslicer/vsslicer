// SPDX-License-Identifier: AGPL-3.0-or-later
// Browser-side entry of the preview webview (esbuild, platform browser, iife). Shows a summary of what
// it received; the renderer (E5) replaces the summary and keeps the buffers it is handed here.
import {
  PROTOCOL_TAG,
  TRANSPORT_SCHEMA_VERSION,
  createWebviewApi,
  createWindowChannel,
  handshake,
  parseEnvelope,
  receiveBuffers,
  type VsCodeApi,
} from '@vsslicer/webview-kit/webview';
import { Method, moveStream, type PreviewSummary, type Received, type ViewState } from '../../domain/summary.ts';

/** Saved with `setState`, so it survives the webview being hidden or reloaded. Camera and colour mode join it with the renderer. */
interface SavedView {
  /** Top visible layer; `null` until a file is shown (then the last layer). */
  layer: number | null;
}

declare const acquireVsCodeApi: () => VsCodeApi<SavedView>;

const api = createWebviewApi<SavedView>(acquireVsCodeApi);
const channel = createWindowChannel(api.post, window);
const root = document.getElementById('root') ?? document.body;
const session = crypto.randomUUID();

let summary: PreviewSummary | undefined;
let buffers: (ArrayBuffer | undefined)[] = [];

const show = (title: string, lines: string[] = []) => {
  const h = document.createElement('h2');
  h.textContent = title;
  const list = document.createElement('ul');
  for (const l of lines) list.append(Object.assign(document.createElement('li'), { textContent: l }));
  root.replaceChildren(h, list);
};

const time = (s: number) => `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${Math.round(s % 60)}s`;

const render = (state: ViewState) => {
  if (state.status === 'loading') return show('Loading G-code...');
  if (state.status === 'unsupported') return show('Not supported yet', [state.message]);
  if (state.status === 'error') return show('Could not open this file', [`${state.message} (${state.code})`]);
  summary = state.summary;
  buffers = summary.moveBuffers.map(() => undefined);
  const s = summary;
  show(`${s.kind} from ${s.slicer}`, [
    `${s.moveCount} moves in ${s.moveBuffers.length} buffers, ${s.layers.length} layers`,
    `Print time ${time(s.totalTime)} (${s.planner}${s.estimate ? ', estimate' : ''}, ${s.flavour}${s.flavourAssumed ? ' assumed' : ''})`,
    `${s.objects.length} objects, ${s.thumbnails} thumbnails, ${s.diagnosticCount} diagnostics`,
  ]);
  done();
};

const done = () => {
  if (!summary || buffers.some((b) => !b)) return;
  const saved = api.getState();
  api.setState({ layer: saved?.layer ?? Math.max(0, summary.layers.length - 1) });
  const received: Received = {
    buffers: buffers.map((b) => ({ byteLength: b!.byteLength, arrayBuffer: b instanceof ArrayBuffer })),
    stateSaved: api.getState() !== undefined,
  };
  channel.post({
    tag: PROTOCOL_TAG,
    v: TRANSPORT_SCHEMA_VERSION,
    kind: 'notification',
    method: Method.received,
    payload: received,
  });
  summary = undefined; // report once per load
};

// subscribe before the handshake: the host answers the welcome with the state and the buffers
receiveBuffers(channel, {
  onBuffer(stream, data) {
    const i = buffers.findIndex((_, j) => moveStream(session, j) === stream);
    if (i < 0) return;
    buffers[i] = data;
    done();
  },
  onError: (stream, error) => show('Transfer failed', [`${stream}: ${error.message}`]),
});
channel.onMessage((m) => {
  const r = parseEnvelope(m);
  if (r.ok && r.envelope.kind === 'notification' && r.envelope.method === Method.state)
    render(r.envelope.payload as ViewState);
});
handshake(channel, session).catch((e: Error) => show('Could not connect to VS Code', [e.message]));
