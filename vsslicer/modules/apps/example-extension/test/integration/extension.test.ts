// SPDX-License-Identifier: AGPL-3.0-or-later
// Runs inside VS Code (pnpm test:integration), not under `node --test`.
import assert from 'node:assert';
import * as vscode from 'vscode';

const hello = 'vsslicer.example.hello';
const webview = 'vsslicer.example.webview';

describe('example extension in VS Code', () => {
  before(async () => {
    const ext = vscode.extensions.all.find(
      (e) => (e.packageJSON as { name?: string }).name === '@vsslicer/example-extension',
    );
    assert.ok(ext, 'extension under development is loaded');
    await ext.activate();
    assert.ok(ext.isActive);
  });

  it('registers both commands', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes(hello));
    assert.ok(commands.includes(webview));
  });

  it('runs the hello command', async () => {
    // The command shows a notification, and executeCommand resolves only once it is dismissed: a rejection is the failure.
    const settled = await Promise.race([
      vscode.commands.executeCommand(hello).then(() => 'done'),
      new Promise((r) => setTimeout(() => r('pending'), 500)),
    ]);
    assert.ok(settled === 'done' || settled === 'pending');
  });

  it('opens the webview', async () => {
    await vscode.commands.executeCommand(webview);
    const webviewTab = () =>
      vscode.window.tabGroups.all.flatMap((g) => g.tabs).find((t) => t.input instanceof vscode.TabInputWebview);
    for (let i = 0; i < 50 && !webviewTab(); i++) await new Promise((r) => setTimeout(r, 100)); // the tab model updates asynchronously
    assert.ok(webviewTab(), 'a webview tab is open');
  });
});
