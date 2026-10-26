// SPDX-License-Identifier: AGPL-3.0-or-later
// Runs inside VS Code (pnpm test:integration), not under `node --test`.
import assert from 'node:assert';
import * as vscode from 'vscode';

describe('slicer extension in VS Code', () => {
  it('activates and registers the about command', async () => {
    const ext = vscode.extensions.all.find(
      (e) => (e.packageJSON as { name?: string }).name === '@vsslicer/slicer-extension',
    );
    assert.ok(ext, 'extension under development is loaded');
    await ext.activate();
    assert.ok((await vscode.commands.getCommands(true)).includes('vsslicer.slicer.about'));
  });
});
