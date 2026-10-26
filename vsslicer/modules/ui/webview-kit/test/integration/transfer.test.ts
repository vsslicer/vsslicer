// SPDX-License-Identifier: AGPL-3.0-or-later
// Runs inside VS Code (pnpm test:integration): 200 MiB from the extension host into a real webview, hash compared.
import * as assert from 'node:assert';
import { createHash, randomFillSync } from 'node:crypto';
import { sendBuffer } from '../../src/host/index.ts';
import { MiB, openPanel } from './harness.ts';

const SIZE = Number(process.env.VSSLICER_TRANSFER_MIB ?? 200) * MiB; // the override is for debugging only
describe('host to webview transfer', function () {
  this.timeout(180_000);

  it('moves 200 MiB with 4 MiB chunks and the webview hashes the same bytes', async () => {
    const payload = Buffer.allocUnsafe(SIZE);
    for (let at = 0; at < SIZE; at += 16 * MiB) randomFillSync(payload, at, Math.min(16 * MiB, SIZE - at));
    const expected = createHash('sha256').update(payload).digest('hex');

    const { panel, channel, next } = openPanel();

    try {
      await next('ready');

      const rssBefore = process.memoryUsage().rss;
      const t0 = performance.now();
      await sendBuffer(channel, 'big', payload, { chunkSize: 4 * MiB, window: 4, timeoutMs: 60_000 });
      const sent = performance.now() - t0;
      const result = await next('result');
      const total = performance.now() - t0;

      console.log(
        `transfer ${SIZE / MiB} MiB: sent+acked ${sent.toFixed(0)} ms, hashed in webview by ${total.toFixed(0)} ms ` +
          `(${((SIZE / MiB / sent) * 1000).toFixed(0)} MiB/s); ext host rss ${(rssBefore / MiB).toFixed(0)} -> ` +
          `${(process.memoryUsage().rss / MiB).toFixed(0)} MiB; webview js heap ` +
          `${typeof result.heap === 'number' ? (result.heap / MiB).toFixed(0) + ' MiB' : 'n/a'}`,
      );
      assert.strictEqual(result.bytes, SIZE);
      assert.strictEqual(result.hash, expected);
    } finally {
      panel.dispose();
    }
  });
});
