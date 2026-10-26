// SPDX-License-Identifier: AGPL-3.0-or-later
// Page script for the headless-Chromium test: bundled by the test, served under the webview kit's CSP.
import { blobWorkerSpawner, createWebModelWorkerPool } from '../../src/adapters/worker-web/pool.ts';

(globalThis as unknown as { run: unknown }).run = async (size: number, urls: string[]) => {
  const { spawn, revoke } = await blobWorkerSpawner('/worker.js');
  const pool = createWebModelWorkerPool({ size, spawn });
  try {
    const results = await Promise.all(urls.map((u) => pool.parseUrl(u, { extension: u.split('.').pop() })));
    const owned = new Uint8Array(await (await fetch(urls[0]!)).arrayBuffer());
    await pool.parse(owned);
    return {
      results: results.map((r) => ({
        kind: r.kind,
        triangles: r.kind === 'parsed' ? r.mesh.indices.length / 3 : r.triangleCount,
        hasBvh: r.kind === 'parsed' && r.bvh.roots.length > 0,
      })),
      inputBytesAfterTransfer: owned.byteLength,
    };
  } finally {
    pool.dispose();
    revoke();
  }
};
