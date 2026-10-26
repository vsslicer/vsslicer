// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from 'node:assert';
import * as vscode from 'vscode';

describe('slicer settings in VS Code', () => {
  it('exposes the contributed defaults', () => {
    const c = vscode.workspace.getConfiguration('vsslicer.slicer');
    assert.strictEqual(c.get('engine'), 'orca');
    assert.strictEqual(c.get('timeout'), 600);
    assert.strictEqual(c.get('outputFolder'), '.vsslicer/sliced');
  });
});
