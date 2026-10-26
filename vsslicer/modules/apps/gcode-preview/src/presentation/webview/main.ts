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
import { MoveFlag, type Layer } from '@vsslicer/gcode-api';
import {
  Method,
  moveStream,
  type PreviewSummary,
  type Progress,
  type Received,
  type TimelineCommand,
  type WindowRequest,
  windowSeq,
  type ViewState,
} from '../../domain/summary.ts';
import { orbit, pan, presetCamera, zoom, type CameraState, type ViewPreset } from './camera.ts';
import { SPEEDS, createClock, createMarker, layerOfMove, positionAt, project, stepTime } from './timeline.ts';
import { nextView, presentRoles, roleName, type ViewEvent } from './controls.ts';
import { COLOR_MODES, legendFor } from './legend.ts';
import {
  concatMoves,
  createPreviewRenderer,
  frameCamera,
  visibleRange,
  type PreviewRenderer,
  type Visibility,
} from './preview-renderer.ts';

/** Saved with `setState`, so it survives the webview being hidden or reloaded.  */
interface SavedView extends Omit<Visibility, 'layer'> {
  /** Top visible layer; `null` until a file is shown (then the last layer). */
  layer: number | null;
  // bottom, move, roleMask and hiddenFlags come from Visibility
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

/** The layers of the open file and what the controls need beside them (kept after the summary is released). */
let info = {
  layers: [] as Layer[],
  layerTimes: [] as number[],
  moveCount: 0,
  roles: [] as number[],
  moves: new ArrayBuffer(0),
  duration: 0,
};
let clock = createClock(0);
/** Marker position in world coordinates; undefined before the first sample. */
let head: number[] | undefined;
let headMove = 0;
let windows: ReturnType<typeof createMarker> | undefined;
const stage = document.createElement('div');
stage.style.position = 'relative';
const marker = document.createElement('div');
marker.style.cssText =
  'position:absolute;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:#fff;border:2px solid #f00;pointer-events:none;display:none';
stage.append(canvas, marker);
const toolbar = document.createElement('div');
const legend = document.createElement('span');
const bar = document.createElement('span');
const panel = document.createElement('div');
panel.style.cssText =
  'display:flex;flex-direction:column;gap:4px;margin:8px 0;font-family:var(--vscode-font-family);color:var(--vscode-foreground)';
bar.style.cssText =
  'display:inline-block;width:8em;height:0.8em;vertical-align:middle;background:linear-gradient(to right,blue,cyan,lime,yellow,red)'; // the kit's range palette, blue low to red high
const slider = (label: string) => {
  const input = Object.assign(document.createElement('input'), {
    type: 'range',
    min: '0',
    step: '1',
    ariaLabel: label,
  });
  const out = document.createElement('output');
  const row = document.createElement('label');
  row.style.cssText = 'display:flex;gap:8px;align-items:center';
  row.append(label, input, out);
  panel.append(row);
  return { input, out };
};
const topLayer = slider('Top layer');
const bottomLayer = slider('Bottom layer');
const moveSlider = slider('Moves in the top layer');
const timeline = document.createElement('div');
timeline.style.cssText = 'display:flex;gap:8px;align-items:center';
const playButton = Object.assign(document.createElement('button'), { textContent: 'Play' });
const stepBack = Object.assign(document.createElement('button'), { textContent: 'Step back', ariaLabel: 'Step back' });
const stepForward = Object.assign(document.createElement('button'), { textContent: 'Step', ariaLabel: 'Step' });
const speeds = Object.assign(document.createElement('select'), { ariaLabel: 'Speed' });
for (const x of SPEEDS) speeds.append(new Option(`${x}x`, String(x)));
speeds.value = '1';
const clockSlider = Object.assign(document.createElement('input'), {
  type: 'range',
  min: '0',
  step: 'any',
  ariaLabel: 'Time',
});
const clockOut = document.createElement('output');
timeline.append(playButton, stepBack, stepForward, speeds, clockSlider, clockOut);
panel.prepend(timeline);
const layerTime = document.createElement('div');
const toggles = document.createElement('fieldset');
toggles.style.border = 'none';
toggles.style.padding = '0';
const toggle = (label: string, checked: boolean, onChange: (on: boolean) => void) => {
  const box = Object.assign(document.createElement('input'), { type: 'checkbox', checked });
  box.addEventListener('change', () => onChange(box.checked));
  const l = document.createElement('label');
  l.style.marginRight = '12px';
  l.append(box, ` ${label}`);
  toggles.append(l);
  return box;
};
let roleBoxes: [number, HTMLInputElement][] = [];
let travelBox: HTMLInputElement | undefined;
const patch = (e: ViewEvent) => {
  api.setState(nextView(api.getState()!, e));
  redraw();
};
topLayer.input.addEventListener('input', () => patch({ kind: 'top', value: Number(topLayer.input.value) }));
bottomLayer.input.addEventListener('input', () => patch({ kind: 'bottom', value: Number(bottomLayer.input.value) }));
moveSlider.input.addEventListener('input', () =>
  patch({ kind: 'move', value: Number(moveSlider.input.value), max: Number(moveSlider.input.max) }),
);
panel.append(layerTime, toggles);
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
  root.replaceChildren(h, list, ...(view ? [toolbar, panel, stage] : []));
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
  placeMarker(camera);
  const l = legendFor(colorMode, renderer.ranges());
  legend.replaceChildren();
  if (l.kind === 'gradient' && l.range)
    legend.append(' ', bar, ` ${l.range.map((x) => x.toFixed(1)).join(' to ')} ${l.unit}`);
  else legend.append(` ${l.label}: see the feature toggles`);
  syncControls(s);
};

const placeMarker = (camera: CameraState) => {
  const { view, projection } = frameCamera(renderer?.bounds ?? [[0], [0]], aspect(), camera);
  const p = head && renderer ? project(view, projection, head) : undefined;
  marker.style.display = p ? 'block' : 'none';
  if (p) [marker.style.left, marker.style.top] = [`${p[0] * 100}%`, `${p[1] * 100}%`];
};

/** Puts the saved state on the sliders, labels and toggles (the state is the source of truth). */
const syncControls = (s: SavedView) => {
  const { layers, layerTimes, moveCount } = info;
  const top = s.layer ?? 0;
  const bottom = s.bottom ?? 0;
  const set = (c: typeof topLayer, max: number, value: number, text: string) => {
    c.input.max = String(max);
    c.input.value = String(value);
    c.input.ariaValueText = text;
    c.out.textContent = text;
  };
  const z = (i: number) => (layers[i] ? `${i + 1} (z ${layers[i]!.z.toFixed(2)})` : '-');
  set(topLayer, Math.max(0, layers.length - 1), top, z(top));
  set(bottomLayer, Math.max(0, layers.length - 1), bottom, z(bottom));
  const full = visibleRange(layers, moveCount, top).count - (layers[top]?.firstMove ?? 0);
  const move = s.move ?? full;
  set(moveSlider, full, move, `${move} of ${full}`);
  layerTime.textContent = `Layer ${top + 1} time ${time(layerTimes[top] ?? 0)}; layers ${bottom + 1} to ${top + 1} ${time(layerTimes.slice(bottom, top + 1).reduce((a, b) => a + b, 0))}`;
  const mask = s.roleMask ?? 0xffffffff;
  for (const [r, box] of roleBoxes) box.checked = ((mask >>> r) & 1) === 1;
  if (travelBox) travelBox.checked = ((s.hiddenFlags ?? MoveFlag.Travel) & MoveFlag.Travel) === 0;
};

const buildToggles = () => {
  toggles.replaceChildren();
  roleBoxes = info.roles.map((r) => [r, toggle(roleName(r), true, () => patch({ kind: 'role', value: r }))]);
  travelBox = toggle('Travel moves', false, () => patch({ kind: 'travel' }));
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
  head = undefined;
  cancelAnimationFrame(frame);
  if (state.status === 'loading') return show('Loading G-code...');
  if (state.status === 'unsupported') return show('Not supported yet', [state.message]);
  if (state.status === 'error') {
    show('Could not open this file', [`${state.message} (${state.code})`]);
    const retry = Object.assign(document.createElement('button'), { textContent: 'Retry' });
    retry.addEventListener('click', () => {
      retry.disabled = true;
      channel.post({ tag: PROTOCOL_TAG, v: TRANSPORT_SCHEMA_VERSION, kind: 'notification', method: Method.retry });
    });
    return root.append(retry);
  }
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
  api.setState(nextView(api.getState(), { kind: 'load', layerCount: summary.layers.length }));
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
  info = {
    layers: s.layers,
    layerTimes: s.layerTimes,
    moveCount: s.moveCount,
    roles: presentRoles(moves),
    moves,
    duration: s.totalTime,
  };
  clock = createClock(s.totalTime);
  windows = createMarker(moves, s.moveCount, (seq, from, to) =>
    channel.post({
      tag: PROTOCOL_TAG,
      v: TRANSPORT_SCHEMA_VERSION,
      kind: 'notification',
      method: Method.window,
      payload: { seq, from, to } satisfies WindowRequest,
    }),
  );
  speeds.value = '1';
  clockSlider.max = String(s.totalTime);
  buildToggles();
  buffers = []; // the concatenated copy is the only one kept
  summary = undefined; // report once per load
  mount(s, moves);
  apply(false); // place the marker only: the saved view (or GCP-35's whole print) stays
  report(); // tells the host the timeline is ready
};

// Timeline: the clock drives the visibility range (layer and move count, so scrubbing never uploads) and the marker.
let frame = 0;
let lastTick = 0;
let lastReport = 0;
const report = () => {
  const c = clock.state;
  const progress: Progress = { time: c.time, move: headMove, playing: c.playing, speed: c.speed };
  channel.post({
    tag: PROTOCOL_TAG,
    v: TRANSPORT_SCHEMA_VERSION,
    kind: 'notification',
    method: Method.progress,
    payload: progress,
  });
  lastReport = performance.now();
};
const apply = (setView = true) => {
  if (!renderer || !info.moveCount) return;
  const xyz = [0, 0, 0];
  headMove = windows?.sample(clock.state.time, xyz) ?? positionAt(info.moves, clock.state.time, info.duration, xyz);
  head = xyz;
  const { layer, move } = layerOfMove(info.layers, headMove);
  clockSlider.value = String(clock.state.time);
  clockOut.textContent = `${time(clock.state.time)} / ${time(info.duration)}`;
  playButton.textContent = clock.state.playing ? 'Pause' : 'Play';
  if (setView) patch({ kind: 'play', layer, move });
  else redraw();
};
const seekTo = (t: number) => {
  clock.seek(t);
  apply();
  report();
};
const setPlaying = (on: boolean) => {
  cancelAnimationFrame(frame);
  if (on) {
    clock.play();
    lastTick = performance.now();
    const step = (now: number) => {
      clock.tick(Math.max(0, now - lastTick) / 1000);
      lastTick = now;
      apply();
      if (!clock.state.playing) return void report();
      if (now - lastReport > 250) report();
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  } else clock.pause();
  apply();
  report();
};
// a retained but hidden preview must not keep playing (and redrawing)
document.addEventListener('visibilitychange', () => document.hidden && clock.state.playing && setPlaying(false));
const command = (c: TimelineCommand) => {
  if (c.action === 'play') setPlaying(true);
  else if (c.action === 'pause') setPlaying(false);
  else if (c.action === 'speed') {
    clock.setSpeed(c.value);
    speeds.value = String(clock.state.speed);
    report();
  } else if (c.action === 'step') seekTo(stepTime(info.moves, clock.state.time, c.direction, info.duration));
};
playButton.addEventListener('click', () => command({ action: clock.state.playing ? 'pause' : 'play' }));
stepBack.addEventListener('click', () => command({ action: 'step', direction: -1 }));
stepForward.addEventListener('click', () => command({ action: 'step', direction: 1 }));
speeds.addEventListener('change', () => command({ action: 'speed', value: Number(speeds.value) }));
clockSlider.addEventListener('input', () => seekTo(Number(clockSlider.value)));

// subscribe before the handshake: the host answers the welcome with the state and the buffers
receiveBuffers(channel, {
  onBuffer(stream, data) {
    const w = windowSeq(session, stream);
    if (w !== undefined) {
      windows?.accept(w, data as ArrayBuffer);
      if (!clock.state.playing) apply(false); // a paused marker moves to the planner's position
      return;
    }
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
  else if (r.ok && r.envelope.kind === 'notification' && r.envelope.method === Method.command)
    command(r.envelope.payload as TimelineCommand);
});
handshake(channel, session).catch((e: Error) => show('Could not connect to VS Code', [e.message]));
