// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';
import assert from 'node:assert';
import { existsSync } from 'node:fs';
import { registerCommands, type Api } from '../src/presentation/commands.ts';

const setup = () => {
  const handlers: Record<string, () => unknown> = {};
  const messages: string[] = [];
  const panel = {
    webview: {
      html: '',
      cspSource: 'vscode-resource:',
      asWebviewUri: (u: { path: string }) => ({ toString: () => `vscode-webview://x${u.path}` }),
    },
  };
  const api = {
    commands: { registerCommand: (id: string, fn: () => unknown) => ((handlers[id] = fn), { dispose() {} }) },
    window: { showInformationMessage: (m: string) => messages.push(m), createWebviewPanel: () => panel },
    Uri: { joinPath: (base: { path: string }, ...p: string[]) => ({ path: [base.path, ...p].join('/') }) },
  } as unknown as Api;
  const context = { subscriptions: [] as { dispose(): unknown }[], extensionUri: { path: '/ext' } } as never;
  registerCommands(context, api);
  return { handlers, messages, panel, subscriptions: (context as { subscriptions: unknown[] }).subscriptions };
};

test('registers both commands and the hello command greets via @vsslicer/example', () => {
  const { handlers, messages, subscriptions } = setup();
  handlers['vsslicer.example.hello']?.();
  assert.strictEqual(subscriptions.length, 2);
  assert.ok(handlers['vsslicer.example.webview']);
  assert.deepStrictEqual(messages, ['Hello, VSSlicer!']);
});

test('webview HTML has the CSP, a matching nonce and the bundle URI', () => {
  const { handlers, panel } = setup();
  handlers['vsslicer.example.webview']?.();
  const html = panel.webview.html;
  const nonce = /script-src 'nonce-([^']+)'/.exec(html)?.[1];
  assert.ok(nonce);
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /style-src vscode-resource:/);
  assert.ok(html.includes(`<script nonce="${nonce}" src="vscode-webview://x/ext/dist/webview.js">`));
});

test('the webview bundle exists after build', () => {
  assert.ok(existsSync(new URL('../dist/webview.js', import.meta.url)), 'run pnpm build first');
});
