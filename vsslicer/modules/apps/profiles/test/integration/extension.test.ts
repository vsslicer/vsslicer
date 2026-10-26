// SPDX-License-Identifier: AGPL-3.0-or-later
// Runs inside VS Code (pnpm test:integration), not under `node --test`.
import assert from 'node:assert';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import * as vscode from 'vscode';

const KEY = 'nozzle_diameter'; // a per-extruder catalogue key, the only ones the published settings schema lists by name

describe('profiles extension in VS Code', () => {
  it('activates and registers the about command', async () => {
    const ext = vscode.extensions.all.find(
      (e) => (e.packageJSON as { name?: string }).name === '@vsslicer/profiles-extension',
    );
    assert.ok(ext, 'extension under development is loaded');
    await ext.activate();
    assert.ok((await vscode.commands.getCommands(true)).includes('vsslicer.profiles.about'));
  });
});

describe('profile file schema', () => {
  const dir = mkdtempSync(join(tmpdir(), 'vsslicer-profiles-'));
  const open = async (name: string, text: string) => {
    const file = join(dir, '.vsslicer', 'profiles', 'process', name);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, text);
    const doc = await vscode.workspace.openTextDocument(file);
    await vscode.window.showTextDocument(doc);
    return doc;
  };
  const until = async <T>(get: () => T | undefined): Promise<T> => {
    for (let i = 0; i < 300; i++) {
      const v = get();
      if (v) return v;
      await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error('timed out');
  };
  after(() => rmSync(dir, { recursive: true, force: true }));

  it('completes catalogue keys inside settings', async () => {
    const text = '{\n  "id": "p",\n  "settings": {\n    \n  }\n}\n';
    const doc = await open('complete.json', text);
    const at = new vscode.Position(3, 4);
    let got: string[] = [];
    for (let i = 0; i < 100 && !got.includes(KEY); i++) {
      const l = await vscode.commands.executeCommand<vscode.CompletionList>(
        'vscode.executeCompletionItemProvider',
        doc.uri,
        at,
      );
      got = l.items.map((x) => (typeof x.label === 'string' ? x.label : x.label.label));
      if (!got.includes(KEY)) await new Promise((r) => setTimeout(r, 100));
    }
    assert.ok(got.includes(KEY), `catalogue key offered, got ${got.length} items`);
  });

  it('reports a wrong type as a schema error', async () => {
    const doc = await open('wrong.json', '{ "id": "p", "name": "n", "layer_height": "thin" }\n');
    const diags = await until(() => {
      const d = vscode.languages.getDiagnostics(doc.uri);
      return d.length ? d : undefined;
    });
    assert.ok(
      diags.some((d) => /string|number|type/i.test(d.message)),
      diags.map((d) => d.message).join('; '),
    );
  });
});
