// SPDX-License-Identifier: AGPL-3.0-or-later
// Browser-side entry of the preview webview (esbuild, platform browser, iife). Shows a summary of what
// it received, then draws the moves (preview-renderer.ts) under it.
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
import { ColorMode, createGl2Context, showGlFailure } from '@vsslicer/webview-kit/gl';
import { Method, moveStream, type PreviewSummary, type Received, type ViewState } from '../../domain/summary.ts';
import { orbit, pan, presetCamera, zoom, type CameraState, type ViewPreset } from './camera.ts';
import { COLOR_MODES, legendFor } from './legend.ts';
import { concatMoves, createPreviewRenderer, type PreviewRenderer, type Visibility } from './preview-renderer.ts';

/** Saved with `setState`, so it survives the webview being hidden or reloaded.  */
interface SavedView extends Omit<Visibility, 'layer'> {
  /** Top visible layer; `null` until a file is shown (then the last layer). */
  layer: number | null;
  colorMode?: ColorMode;
  camera?: CameraState;
}

declare const acquireVsCodeApi: () => VsCodeApi<SavedView>;

const api = createWebviewApi<SavedView>(acquireVsCodeApi);
const channel = createWindowChannel(api.post, window);
const root = document.getElementById('root') ?? document.body;
const session = crypto.randomUUID();

let summary: PreviewSummary | undefined;
let buffers: (ArrayBuffer | undefined)[] = [];
let renderer: PreviewRenderer | undefined;
const canvas = document.createElement('canvas');
canvas.style.width = '100%';
canvas.style.height = '80vh';

const toolbar = document.createElement('div');
const legend = document.createElement('span');
const modes = document.createElement('select');
modes.ariaLabel = 'Colour by';
for (const m of COLOR_MODES) modes.append(new Option(m.label, String(m.mode)));
toolbar.append(modes, ...(['top', 'iso', 'front'] as const).map((p) => button(p)), legend);
function button(preset: ViewPreset) {
  const b = Object.assign(document.createElement('button'), { textContent: preset });
  b.addEventListener('click', () => setCamera((aspect) => presetCamera(renderer!.bounds, aspect, preset)));
  return b;
}
const aspect = () => canvas.clientWidth / Math.max(1, canvas.clientHeight);
/** Replaces the saved camera (the argument is the current one, absent until the first draw) and redraws. */
const setCamera = (f: (aspect: number, current: CameraState | undefined) => CameraState) => {
  if (!renderer) return;
  api.setState({ ...api.getState()!, camera: f(aspect(), api.getState()?.camera) });
  redraw();
};
modes.addEventListener('change', () => {
  api.setState({ ...api.getState()!, colorMode: Number(modes.value) as ColorMode });
  redraw();
});
canvas.addEventListener('pointerdown', (e) => canvas.setPointerCapture(e.pointerId));
canvas.addEventListener('pointermove', (e) => {
  if (!canvas.hasPointerCapture(e.pointerId)) return;
  // left drag orbits, right or shift drag pans
  const panning = e.buttons & 2 || e.shiftKey;
  setCamera((a, c) =>
    panning
      ? pan(c ?? fit(a), e.movementX, e.movementY, canvas.clientHeight)
      : orbit(c ?? fit(a), e.movementX * 0.01, e.movementY * 0.01),
  );
});
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();
    setCamera((a, c) => zoom(c ?? fit(a), Math.exp(e.deltaY * 0.001)));
  },
  { passive: false },
);
const fit = (a: number) => presetCamera(renderer!.bounds, a);

const show = (title: string, lines: string[] = [], view = false) => {
  const h = document.createElement('h2');
  h.textContent = title;
  const list = document.createElement('ul');
  for (const l of lines) list.append(Object.assign(document.createElement('li'), { textContent: l }));
  root.replaceChildren(h, list, ...(view ? [toolbar, canvas] : []));
};

const redraw = () => {
  const s = api.getState();
  if (!renderer || s?.layer == null) return;
  canvas.width = Math.round(canvas.clientWidth * devicePixelRatio);
  canvas.height = Math.round(canvas.clientHeight * devicePixelRatio);
  const colorMode = s.colorMode ?? ColorMode.Feature;
  const camera = s.camera ?? fit(aspect());
  modes.value = String(colorMode);
  renderer.draw({ ...s, layer: s.layer, colorMode, camera });
  const l = legendFor(colorMode, renderer.ranges());
  legend.textContent = l.range ? ` ${l.range.map((x) => x.toFixed(1)).join(' to ')} ${l.unit}` : '';
};
window.addEventListener('resize', redraw);

const mount = (s: PreviewSummary, moves: ArrayBuffer) => {
  if (moves.byteLength === 0) return;
  const gl = createGl2Context(canvas);
  if (!gl.ok) return void showGlFailure(canvas, gl.error);
  renderer = createPreviewRenderer(canvas, gl.gl, moves, s.layers);
  redraw();
};

const time = (s: number) => `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${Math.round(s % 60)}s`;

const render = (state: ViewState) => {
  renderer?.dispose();
  renderer = undefined;
  if (state.status === 'loading') return show('Loading G-code...');
  if (state.status === 'unsupported') return show('Not supported yet', [state.message]);
  if (state.status === 'error') return show('Could not open this file', [`${state.message} (${state.code})`]);
  summary = state.summary;
  buffers = summary.moveBuffers.map(() => undefined);
  const s = summary;
  show(
    `${s.kind} from ${s.slicer}`,
    [
      `${s.moveCount} moves in ${s.moveBuffers.length} buffers, ${s.layers.length} layers`,
      `Print time ${time(s.totalTime)} (${s.planner}${s.estimate ? ', estimate' : ''}, ${s.flavour}${s.flavourAssumed ? ' assumed' : ''})`,
      `${s.objects.length} objects, ${s.thumbnails} thumbnails, ${s.diagnosticCount} diagnostics`,
    ],
    true,
  );
  done();
};

const done = () => {
  if (!summary || buffers.some((b) => !b)) return;
  const saved = api.getState();
  api.setState({ ...saved, layer: saved?.layer ?? Math.max(0, summary.layers.length - 1) });
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
  const s = summary;
  const moves = concatMoves(buffers as ArrayBuffer[]);
  buffers = []; // the concatenated copy is the only one kept
  summary = undefined; // report once per load
  mount(s, moves);
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
