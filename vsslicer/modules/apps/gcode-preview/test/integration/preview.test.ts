// SPDX-License-Identifier: AGPL-3.0-or-later
// Runs inside VS Code (pnpm test:integration), not under `node --test`. No other extension is installed.
import assert from 'node:assert';
import * as path from 'node:path';
import * as vscode from 'vscode';
import type { Progress } from '../../src/domain/summary.ts';
import type { PreviewProbe } from '../../src/presentation/provider.ts';
import { GCODE_VIEW_TYPE, OPEN_GCODE_SETTING, PREVIEW_VIEW_TYPE } from '../../src/domain/associations.ts';

// bundled to dist-test/, next to test/
const fixture = (p: string) => vscode.Uri.file(path.resolve(__dirname, '../test/fixtures', p));
const FIVE_SLICERS = [
  'prusaslicer/mini_cube_ps2.8.1.gcode',
  'superslicer/superslicer-2.3.56-arcwelder.gcode',
  'orca/cube-marlin.gcode',
  'bambu-studio/cube.gcode',
  'cura/cube-cylinder-4.10.0.gcode',
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const until = async <T>(get: () => T | undefined, what: string): Promise<T> => {
  for (let i = 0; i < 100; i++) {
    const v = get();
    if (v) return v;
    await sleep(100); // the tab model and settings update asynchronously
  }
  throw new Error(`timed out waiting for ${what}`);
};
const customTab = (uri: vscode.Uri) =>
  vscode.window.tabGroups.all
    .flatMap((g) => g.tabs)
    .map((t) => t.input)
    .find((i): i is vscode.TabInputCustom => i instanceof vscode.TabInputCustom && i.uri.toString() === uri.toString());

describe('G-code preview custom editor', () => {
  let probe: PreviewProbe;
  const textDocuments: string[] = [];
  let listener: vscode.Disposable;

  before(async () => {
    listener = vscode.workspace.onDidOpenTextDocument((d) => textDocuments.push(d.uri.toString()));
    const ext = vscode.extensions.all.find(
      (e) => (e.packageJSON as { name?: string }).name === '@vsslicer/gcode-preview',
    );
    assert.ok(ext, 'extension under development is loaded');
    probe = (await ext.activate()) as PreviewProbe;
  });
  afterEach(() => vscode.commands.executeCommand('workbench.action.closeAllEditors'));
  after(() => listener.dispose());

  const expectDelivered = async (uri: vscode.Uri) => {
    const state = await probe.state(uri.toString());
    assert.strictEqual(state.status, 'ready', JSON.stringify(state));
    if (state.status !== 'ready') return;
    assert.ok(state.summary.moveCount > 100 && state.summary.layers.length > 1);
    assert.ok(state.summary.totalTime > 0);
    const received = await probe.received(uri.toString());
    assert.deepStrictEqual(
      received.buffers,
      state.summary.moveBuffers.map((byteLength) => ({ byteLength, arrayBuffer: true })),
      'every move buffer reached the webview as an ArrayBuffer of the right size',
    );
    assert.ok(received.stateSaved, 'the webview saved its view state with setState');
    return state.summary;
  };

  for (const f of FIVE_SLICERS)
    it(`opens ${f} in the preview`, async () => {
      const uri = fixture(f);
      await vscode.commands.executeCommand('vscode.openWith', uri, GCODE_VIEW_TYPE);
      assert.strictEqual((await until(() => customTab(uri), 'the custom editor tab')).viewType, GCODE_VIEW_TYPE);
      const summary = await expectDelivered(uri);
      assert.notStrictEqual(summary?.slicer, 'unknown');
    });

  it('plays, pauses, steps and changes speed on the timeline', async () => {
    const uri = fixture('orca/cube-marlin.gcode');
    const key = uri.toString();
    await vscode.commands.executeCommand('vscode.openWith', uri, GCODE_VIEW_TYPE);
    await until(() => customTab(uri), 'the custom editor tab');
    const summary = await expectDelivered(uri);
    const at = (what: string, ok: (p: Progress) => boolean) =>
      until(() => (probe.progress(key) && ok(probe.progress(key)!) ? probe.progress(key) : undefined), what);
    await until(() => probe.progress(key), 'the timeline to be ready'); // reported once the webview has mounted
    probe.command(key, { action: 'speed', value: 500 });
    await at('the speed', (p) => p.speed === 500);
    probe.command(key, { action: 'play' });
    const playing = await at('time to advance while playing', (p) => p.playing && p.time > 0);
    assert.ok(playing.move > 0);
    probe.command(key, { action: 'pause' });
    const paused = await at('the pause', (p) => !p.playing);
    await sleep(500);
    assert.strictEqual(probe.progress(key)?.time, paused.time, 'a paused timeline stands still');
    probe.command(key, { action: 'step', direction: 1 });
    const stepped = await at('the step', (p) => p.time > paused.time);
    assert.ok(stepped.move >= paused.move && !stepped.playing);
    probe.command(key, { action: 'step', direction: -1 });
    await at('the step back', (p) => p.time < stepped.time);
    probe.command(key, { action: 'play' });
    const end = await at('the print to end', (p) => !p.playing && p.time >= summary!.totalTime - 1e-3);
    assert.strictEqual(end.move, summary!.moveCount - 1, 'the marker ends on the last move');
  });

  it('opens a .bgcode in the preview by default', async () => {
    const uri = fixture('prusaslicer/mini_cube_ps2.8.1.bgcode');
    await vscode.commands.executeCommand('vscode.open', uri);
    assert.strictEqual((await until(() => customTab(uri), 'the custom editor tab')).viewType, PREVIEW_VIEW_TYPE);
    assert.strictEqual((await expectDelivered(uri))?.kind, 'bgcode');
  });

  it('opens a .gcode.3mf by default and loads its first plate', async () => {
    const uri = fixture('bambu-studio/h2c-cube.gcode.3mf');
    await vscode.commands.executeCommand('vscode.open', uri);
    assert.strictEqual((await until(() => customTab(uri), 'the custom editor tab')).viewType, PREVIEW_VIEW_TYPE);
    assert.strictEqual((await expectDelivered(uri))?.panel.plate, 1);
  });

  it('opens *.gcode in the preview by default only with the setting on', async () => {
    const uri = fixture('orca/cube-marlin.gcode');
    const associations = () =>
      vscode.workspace.getConfiguration('workbench').get<Record<string, string>>('editorAssociations') ?? {};
    assert.strictEqual(associations()['*.gcode'], undefined);
    await vscode.workspace.getConfiguration().update(OPEN_GCODE_SETTING, true, vscode.ConfigurationTarget.Global);
    await until(() => associations()['*.gcode'] === GCODE_VIEW_TYPE, 'the editor association');
    await vscode.commands.executeCommand('vscode.open', uri);
    assert.strictEqual((await until(() => customTab(uri), 'the custom editor tab')).viewType, GCODE_VIEW_TYPE);
    await vscode.workspace.getConfiguration().update(OPEN_GCODE_SETTING, false, vscode.ConfigurationTarget.Global);
    await until(() => associations()['*.gcode'] === undefined || undefined, 'the association to be removed');
  });

  it('never turned a previewed file into a TextDocument', () => {
    const previewed = [...FIVE_SLICERS, 'prusaslicer/mini_cube_ps2.8.1.bgcode', 'bambu-studio/h2c-cube.gcode.3mf'].map(
      (f) => fixture(f).toString(),
    );
    assert.deepStrictEqual(
      textDocuments.filter((d) => previewed.includes(d)),
      [],
    );
    assert.deepStrictEqual(
      vscode.workspace.textDocuments.map((d) => d.uri.toString()).filter((d) => previewed.includes(d)),
      [],
    );
  });
});
