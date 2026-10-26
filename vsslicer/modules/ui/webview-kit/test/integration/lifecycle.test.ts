// SPDX-License-Identifier: AGPL-3.0-or-later
// Runs inside VS Code (pnpm test:integration): hide and restore, dispose mid-transfer, and the webview's CSP.
import * as assert from 'node:assert';
import * as vscode from 'vscode';
import { TimeoutError, sendBuffer } from '../../src/host/index.ts';
import { MiB, openPanel, sleep, until } from './harness.ts';

describe('webview lifecycle', function () {
  this.timeout(60_000);

  it('hide and show again restores the state set with setState', async () => {
    const { panel, next, log } = openPanel();
    const other = [] as vscode.WebviewPanel[];
    try {
      assert.strictEqual((await next('ready')).state, undefined);
      await panel.webview.postMessage({ cmd: 'setState', value: { n: 42 } });
      await next('stateSet');

      // A second panel in the same column hides the first; its page (no retainContextWhenHidden) is destroyed.
      other.push(vscode.window.createWebviewPanel('vsslicerKitTest', 'other', vscode.ViewColumn.One, {}));
      await until('first panel hidden', () => !panel.visible);
      other.pop()!.dispose();
      panel.reveal(vscode.ViewColumn.One);
      await until('first panel visible', () => panel.visible);

      // The reloaded page handshakes again and reads its state back.
      assert.deepStrictEqual((await next('ready')).state, { n: 42 });
      assert.deepStrictEqual(
        log.filter((m) => m.type === 'csp'),
        [],
      );
    } finally {
      other.forEach((p) => p.dispose());
      panel.dispose();
    }
  });

  it('disposing mid-transfer warns once, frees every listener and fails the sender', async () => {
    const { panel, channel, next, warnings, receivers } = openPanel();
    await next('ready');
    assert.ok(receivers() > 0, 'the channel subscribed to the panel');
    const sending = sendBuffer(channel, 'doomed', new Uint8Array(64 * MiB), {
      chunkSize: MiB,
      window: 4,
      timeoutMs: 1500,
    });
    const outcome = sending.then(
      () => 'resolved',
      (e: unknown) => e,
    );
    await sleep(5);
    panel.dispose();
    channel.post({ after: 'dispose' }); // what a still-running sender does next
    assert.strictEqual(receivers(), 0, 'no listener left on the disposed panel');
    assert.ok(channel.disposed);
    assert.ok((await outcome) instanceof TimeoutError, 'the sender gives up instead of hanging');
    assert.strictEqual(warnings.length, 1, warnings.join(' | '));
  });

  it('shows no CSP violation or console error, and a probe proves the capture works', async () => {
    const { panel, channel, next, log } = openPanel();
    try {
      await next('ready');
      await sendBuffer(channel, 'small', new Uint8Array(8 * MiB), { chunkSize: 4 * MiB });
      await next('result');
      await sleep(300); // violations are reported asynchronously
      const noise = log.filter((m) => m.type === 'csp' || m.type === 'console');
      assert.deepStrictEqual(noise, [], 'a normal session is clean');

      await panel.webview.postMessage({ cmd: 'probeCsp' });
      const violation = await next('csp');
      assert.match(String(violation.directive), /connect-src/);
    } finally {
      panel.dispose();
    }
  });
});
