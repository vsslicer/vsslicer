// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from '@playwright/test';

// Snapshots are only valid on Linux (fonts and rasteriser differ per OS): they are written only when
// UPDATE_SNAPSHOTS=1 on Linux, and Playwright's own --update-snapshots is refused everywhere.
const linux = process.platform === 'linux';
const update = process.env['UPDATE_SNAPSHOTS'] === '1';
if (process.argv.some((arg) => arg.startsWith('--update-snapshots') || arg === '-u')) {
  throw new Error(
    '--update-snapshots is not allowed; run UPDATE_SNAPSHOTS=1 pnpm test:snapshot on Linux (see README).',
  );
}
if (update && !linux) {
  throw new Error(
    `UPDATE_SNAPSHOTS=1 is refused on ${process.platform}: snapshots are written on Linux only (see README).`,
  );
}

export default defineConfig({
  testDir: 'test',
  testMatch: '*.spec.ts',
  updateSnapshots: update ? 'all' : 'none',
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    launchOptions: {
      // SwiftShader: software WebGL on machines without a GPU (CI); the specs fail if another renderer is used.
      args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
    },
  },
});
