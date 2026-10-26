// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { registerPreview, type Api } from '../src/presentation/provider.ts';
import { GCODE_VIEW_TYPE, OPEN_GCODE_SETTING, PREVIEW_VIEW_TYPE } from '../src/domain/associations.ts';
import type { LoadPort } from '../src/application/preview-session.ts';

const uri = (path: string, scheme = 'file') => ({ path, fsPath: path, scheme, toString: () => `${scheme}://${path}` });

interface FakeProvider {
  openCustomDocument(uri: unknown): { dispose(): void };
  resolveCustomEditor(document: unknown, panel: unknown): void;
  saveCustomDocument?: unknown;
}

const setup = (settings: { open?: boolean; associations?: Record<string, string> } = {}) => {
  const providers: { viewType: string; provider: FakeProvider; options: unknown }[] = [];
  const updates: unknown[] = [];
  let onConfig: ((e: { affectsConfiguration(k: string): boolean }) => void) | undefined;
  const api = {
    window: {
      registerCustomEditorProvider: (viewType: string, provider: FakeProvider, options: unknown) => (
        providers.push({ viewType, provider, options }),
        { dispose() {} }
      ),
    },
    workspace: {
      getConfiguration: (section?: string) => ({
        get: (key: string, d: unknown) => (key === OPEN_GCODE_SETTING ? (settings.open ?? d) : d),
        inspect: () => (section === 'workbench' ? { globalValue: settings.associations } : undefined),
        update: async (key: string, value: unknown, target: unknown) =>
          void updates.push({ section, key, value, target }),
      }),
      onDidChangeConfiguration: (l: typeof onConfig) => ((onConfig = l), { dispose() {} }),
    },
    Uri: { joinPath: (base: { path: string }, ...p: string[]) => uri([base.path, ...p].join('/')) },
    ConfigurationTarget: { Global: 1 },
  } as unknown as Api;
  const loads: string[] = [];
  const load: LoadPort = (path) => (loads.push(path), new Promise(() => {}));
  const context = { subscriptions: [] as unknown[], extensionUri: uri('/ext') } as never;
  const probe = registerPreview(context, api, load);
  return {
    providers,
    updates,
    probe,
    loads,
    fireConfig: () => onConfig?.({ affectsConfiguration: (k) => k === OPEN_GCODE_SETTING }),
  };
};

const panel = () => {
  const disposers: (() => void)[] = [];
  return {
    disposers,
    webview: {
      html: '',
      options: {} as { enableScripts?: boolean; localResourceRoots?: { path: string }[] },
      cspSource: 'vscode-resource:',
      asWebviewUri: (u: { path: string }) => ({ toString: () => `vscode-webview://x${u.path}` }),
      postMessage: async () => true,
      onDidReceiveMessage: () => ({ dispose() {} }),
    },
    onDidDispose: (l: () => void) => (disposers.push(l), { dispose() {} }),
  };
};

test('registers one read-only provider for both view types, retained when hidden, one editor per document', () => {
  const { providers } = setup();
  assert.deepStrictEqual(
    providers.map((p) => p.viewType),
    [PREVIEW_VIEW_TYPE, GCODE_VIEW_TYPE],
  );
  for (const p of providers) {
    assert.deepStrictEqual(p.options, {
      webviewOptions: { retainContextWhenHidden: true },
      supportsMultipleEditorsPerDocument: false,
    });
    assert.strictEqual(p.provider, providers[0]!.provider);
    assert.strictEqual(typeof p.provider.openCustomDocument, 'function');
    assert.strictEqual(p.provider.saveCustomDocument, undefined, 'read-only: no save, no edits');
  }
});

test('opening a document starts the worker load; the editor gets the kit CSP and only dist/ as a resource root', async () => {
  const { providers, loads, probe } = setup();
  const { provider } = providers[0]!;
  const doc = provider.openCustomDocument(uri('/w/cube.bgcode'));
  assert.deepStrictEqual(loads, ['/w/cube.bgcode']);
  const p = panel();
  provider.resolveCustomEditor(doc, p);
  assert.strictEqual(p.webview.options.enableScripts, true);
  assert.deepStrictEqual(
    p.webview.options.localResourceRoots?.map((r) => r.path),
    ['/ext/dist'],
  );
  assert.match(p.webview.html, /Content-Security-Policy/);
  assert.match(p.webview.html, /default-src 'none'/);
  const nonce = /script-src 'nonce-([^']+)'/.exec(p.webview.html)?.[1];
  assert.ok(p.webview.html.includes(`nonce="${nonce}" src="vscode-webview://x/ext/dist/webview.js"`));
  assert.ok(probe.state('file:///w/cube.bgcode') instanceof Promise);
  doc.dispose();
  await assert.rejects(probe.state('file:///w/cube.bgcode'), /not open/);
});

test('a remote file is not handed to the worker', async () => {
  const { providers, loads, probe } = setup();
  providers[0]!.provider.openCustomDocument(uri('/w/a.bgcode', 'vscode-remote'));
  assert.deepStrictEqual(loads, []);
  assert.deepStrictEqual(await probe.state('vscode-remote:///w/a.bgcode'), {
    status: 'error',
    code: 'not-local',
    message: 'Only files on this machine can be previewed yet.',
  });
});

test('the setting writes the *.gcode association to user settings on activation and on change', async () => {
  const on = setup({ open: true, associations: { '*.md': 'x' } });
  await new Promise((r) => setImmediate(r));
  assert.deepStrictEqual(on.updates, [
    { section: 'workbench', key: 'editorAssociations', value: { '*.md': 'x', '*.gcode': GCODE_VIEW_TYPE }, target: 1 },
  ]);
  const off = setup({ open: false });
  off.fireConfig();
  await new Promise((r) => setImmediate(r));
  assert.deepStrictEqual(off.updates, []);
});

test('manifest: *.bgcode and *.gcode.3mf are default, *.gcode is option behind the setting', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const editors = pkg.contributes.customEditors as {
    viewType: string;
    priority: string;
    selector: { filenamePattern: string }[];
  }[];
  const byPattern = Object.fromEntries(
    editors.flatMap((e) => e.selector.map((s) => [s.filenamePattern, [e.viewType, e.priority]])),
  );
  assert.deepStrictEqual(byPattern, {
    '*.bgcode': [PREVIEW_VIEW_TYPE, 'default'],
    '*.gcode.3mf': [PREVIEW_VIEW_TYPE, 'default'],
    '*.gcode': [GCODE_VIEW_TYPE, 'option'],
  });
  assert.strictEqual(pkg.contributes.configuration.properties[OPEN_GCODE_SETTING].default, false);
});
