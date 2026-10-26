// SPDX-License-Identifier: AGPL-3.0-or-later
// Runs inside VS Code (pnpm test:integration), not under `node --test`. No other extension is installed.
import assert from 'node:assert';
import { closeSync, mkdtempSync, openSync, rmSync, writeFileSync, writeSync } from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import * as vscode from 'vscode';
import type { LanguageProbe } from '../../src/presentation/features.ts';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const until = async <T>(get: () => T | undefined | Promise<T | undefined>, what: string): Promise<T> => {
  for (let i = 0; i < 100; i++) {
    const v = await get();
    if (v) return v;
    await sleep(100); // diagnostics and settings update asynchronously
  }
  throw new Error(`timed out waiting for ${what}`);
};
const text = (c: string | vscode.MarkdownString | vscode.MarkedString | undefined): string =>
  typeof c === 'string' ? c : c && 'value' in c ? c.value : '';
const hoverText = (hs: vscode.Hover[]) => hs.flatMap((h) => h.contents.map(text)).join('\n');
const labels = (list: vscode.CompletionList) =>
  list.items.map((i) => (typeof i.label === 'string' ? i.label : i.label.label));

// header, then lines: G1 (all flavours), M9999 (nowhere), one code only the flavour has
const FLAVOURS = {
  marlin: { header: ';FLAVOR:Marlin', own: 'M104 S200', foreign: ['SET_PRESSURE_ADVANCE', 'M98'] },
  klipper: { header: '; gcode_flavor = klipper', own: 'SET_PRESSURE_ADVANCE ADVANCE=0.04', foreign: ['M98'] },
  reprapfirmware: {
    header: '; gcode_flavor = reprapfirmware',
    own: 'M98 P"/macros/x"',
    foreign: ['SET_PRESSURE_ADVANCE'],
  },
} as const;

describe('G-code language features', () => {
  let probe: LanguageProbe;
  let dir: string;
  const open = async (name: string, body: string) => {
    const file = path.join(dir, name);
    writeFileSync(file, body);
    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(file));
    await vscode.window.showTextDocument(doc);
    return doc;
  };

  before(async () => {
    dir = mkdtempSync(path.join(tmpdir(), 'vsslicer-lang-'));
    const ext = vscode.extensions.all.find(
      (e) => (e.packageJSON as { name?: string }).name === '@vsslicer/gcode-language',
    );
    assert.ok(ext, 'extension under development is loaded');
    probe = (await ext.activate()) as LanguageProbe;
  });
  afterEach(() => vscode.commands.executeCommand('workbench.action.closeAllEditors'));
  after(() => rmSync(dir, { recursive: true, force: true }));

  for (const [flavour, f] of Object.entries(FLAVOURS))
    describe(flavour, () => {
      it('hovers a catalogued command and a slicer tag', async () => {
        const doc = await open(`${flavour}-hover.gcode`, `${f.header}\n;LAYER_CHANGE\nG1 X1 Y1\n${f.own}\n`);
        assert.strictEqual(probe.flavour(doc.uri.toString()), flavour);
        const g1 = await vscode.commands.executeCommand<vscode.Hover[]>(
          'vscode.executeHoverProvider',
          doc.uri,
          new vscode.Position(2, 1),
        );
        assert.match(hoverText(g1), /G1/);
        assert.match(hoverText(g1), /\[Source\]\(https:\/\//);
        const tag = await vscode.commands.executeCommand<vscode.Hover[]>(
          'vscode.executeHoverProvider',
          doc.uri,
          new vscode.Position(1, 3),
        );
        assert.match(hoverText(tag), /LAYER_CHANGE/);
      });

      it("completes its own commands and parameters, not another flavour's", async () => {
        const doc = await open(`${flavour}-complete.gcode`, `${f.header}\n\nG1 X1 \n`);
        const at = (l: number, c: number) =>
          vscode.commands.executeCommand<vscode.CompletionList>(
            'vscode.executeCompletionItemProvider',
            doc.uri,
            new vscode.Position(l, c),
          );
        const commands = labels(await at(1, 0));
        assert.ok(commands.includes(f.own.split(' ')[0] ?? ''), `${flavour} offers ${f.own}`);
        for (const other of f.foreign) assert.ok(!commands.includes(other), `${flavour} must not offer ${other}`);
        const params = labels(await at(2, 5));
        assert.ok(
          params.includes('Y') && !params.includes('X'),
          `parameters of G1 minus the used X: ${params.join(',')}`,
        );
      });

      it('warns on an unknown G/M code and on nothing catalogued', async () => {
        const doc = await open(`${flavour}-warn.gcode`, `${f.header}\nG1 X1\nM9999\nSTART_PRINT\n`);
        const found = await until(() => {
          const d = vscode.languages.getDiagnostics(doc.uri);
          return d.length ? d : undefined;
        }, 'the diagnostic');
        assert.deepStrictEqual(
          found.map((d) => [d.range.start.line, d.severity, doc.getText(d.range)]),
          [[2, vscode.DiagnosticSeverity.Warning, 'M9999']],
        );
      });
    });

  it('does not warn when the flavour is unknown', async () => {
    const doc = await open('generic.gcode', 'G1 X1\nM9999\n');
    assert.strictEqual(probe.flavour(doc.uri.toString()), undefined);
    await sleep(1200); // longer than the debounce and a scan
    assert.deepStrictEqual(vscode.languages.getDiagnostics(doc.uri), []);
  });

  it('follows the flavour override', async () => {
    const doc = await open('override.gcode', ';FLAVOR:Marlin\nSET_PRESSURE_ADVANCE ADVANCE=0.04\nM98\n');
    const overrides = { [doc.uri.fsPath]: 'klipper' };
    await vscode.workspace
      .getConfiguration('vsslicer.gcode')
      .update('flavourOverrides', overrides, vscode.ConfigurationTarget.Global);
    try {
      await until(() => probe.flavour(doc.uri.toString()) === 'klipper' || undefined, 'the override');
      const found = await until(() => {
        const d = vscode.languages.getDiagnostics(doc.uri);
        return d.length ? d : undefined;
      }, 'the klipper diagnostic');
      assert.deepStrictEqual(
        found.map((d) => doc.getText(d.range)),
        ['M98'],
      );
    } finally {
      await vscode.workspace
        .getConfiguration('vsslicer.gcode')
        .update('flavourOverrides', undefined, vscode.ConfigurationTarget.Global);
    }
  });

  it('turns features off over 50 MB and says why', async () => {
    const file = path.join(dir, 'big.gcode');
    const fd = openSync(file, 'w');
    writeSync(fd, ';FLAVOR:Marlin\nM9999\n');
    const line = Buffer.from('G1 X1 Y1\n'.repeat(1000));
    for (let written = 0; written < 51 * 1024 * 1024; written += line.length) writeSync(fd, line);
    closeSync(fd);
    const uri = vscode.Uri.file(file);
    // VS Code itself keeps a file this size away from extensions: no TextDocument is ever created
    await assert.rejects(async () => vscode.workspace.openTextDocument(uri), /50MB/);
    await vscode.commands.executeCommand('vscode.open', uri);
    assert.match((await until(() => probe.featuresOff(uri.toString()), 'the size gate')) ?? '', /over 50 MB/);
    await until(() => probe.notified(uri.toString()) || undefined, 'the message');
    const hover = await vscode.commands.executeCommand<vscode.Hover[]>(
      'vscode.executeHoverProvider',
      uri,
      new vscode.Position(2, 1),
    );
    assert.deepStrictEqual(hover, []);
    assert.deepStrictEqual(vscode.languages.getDiagnostics(uri), []);
  });
});
