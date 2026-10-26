// SPDX-License-Identifier: AGPL-3.0-or-later
// Runs inside VS Code (pnpm test:integration). GCP-41: a file over 50 MB opens in the custom editor and
// the host's event loop is measured while it loads. The file is generated into the OS temp dir and deleted.
import assert from 'node:assert';
import { mkdtempSync, openSync, writeSync, closeSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { monitorEventLoopDelay } from 'node:perf_hooks';
import * as vscode from 'vscode';
import type { PreviewProbe } from '../../src/presentation/provider.ts';
import { GCODE_VIEW_TYPE } from '../../src/domain/associations.ts';

const BYTES = 51 * 1_000_000;

/** Deterministic straight-move walk (the shape of GCP-18's `straight` profile; modules cannot import each other's bench code). */
const writeBigGcode = (file: string, bytes: number): void => {
  let a = 1;
  const rnd = () => {
    a = (a + 0x6d2b79f5) >>> 0; // mulberry32
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const fd = openSync(file, 'w');
  try {
    let x = 120;
    let y = 120;
    let z = 0.2;
    let sent = 0;
    for (let line = 0; sent < bytes;) {
      let chunk = line === 0 ? 'G90\nM83\nG1 Z0.2 F600\n' : '';
      while (chunk.length < 1 << 20) {
        x = Math.min(240, Math.max(10, x + (rnd() - 0.5) * 4));
        y = Math.min(240, Math.max(10, y + (rnd() - 0.5) * 4));
        chunk += `G1 X${x.toFixed(3)} Y${y.toFixed(3)} E${(rnd() * 0.05).toFixed(5)}\n`;
        if (++line % 2000 === 0) chunk += `G1 Z${(z += 0.2).toFixed(1)}\n`;
      }
      sent += writeSync(fd, chunk);
    }
  } finally {
    closeSync(fd);
  }
};

describe('G-code preview: file over 50 MB', function () {
  this.timeout(300_000); // hang guard only
  let dir: string;
  let probe: PreviewProbe;

  before(async () => {
    dir = mkdtempSync(path.join(tmpdir(), 'gcp-41-'));
    const ext = vscode.extensions.all.find(
      (e) => (e.packageJSON as { name?: string }).name === '@vsslicer/gcode-preview',
    );
    assert.ok(ext, 'extension under development is loaded');
    probe = (await ext.activate()) as PreviewProbe;
  });
  after(async () => {
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    rmSync(dir, { recursive: true, force: true });
  });

  it('opens in the custom editor, not as a TextDocument, and records the host event-loop delay', async () => {
    const file = path.join(dir, 'big.gcode');
    writeBigGcode(file, BYTES);
    assert.ok(statSync(file).size > 50 * 1_000_000);
    const uri = vscode.Uri.file(file);
    const opened: string[] = [];
    const listener = vscode.workspace.onDidOpenTextDocument((d) => opened.push(d.uri.toString()));
    const histogram = monitorEventLoopDelay({ resolution: 10 });
    histogram.enable();
    try {
      await vscode.commands.executeCommand('vscode.openWith', uri, GCODE_VIEW_TYPE);
      const state = await probe.state(uri.toString());
      assert.strictEqual(state.status, 'ready', JSON.stringify(state));
      if (state.status !== 'ready') return;
      assert.ok(state.summary.moveCount > 1_000_000, 'the whole file was parsed (by the worker thread)');
      const received = await probe.received(uri.toString());
      assert.strictEqual(received.buffers.length, state.summary.moveBuffers.length);
    } finally {
      histogram.disable();
      listener.dispose();
    }
    // Recorded, not asserted: wall time depends on the machine (rule 5).
    console.log(
      `GCP-41 host event-loop delay while opening ${statSync(file).size} bytes: max ${(histogram.max / 1e6).toFixed(1)} ms, ` +
        `mean ${(histogram.mean / 1e6).toFixed(1)} ms, p99 ${(histogram.percentile(99) / 1e6).toFixed(1)} ms`,
    );
    const key = uri.toString();
    assert.deepStrictEqual(
      opened.filter((d) => d === key),
      [],
      'no TextDocument was opened for it',
    );
    assert.deepStrictEqual(
      vscode.workspace.textDocuments.map((d) => d.uri.toString()).filter((d) => d === key),
      [],
    );
  });
});
