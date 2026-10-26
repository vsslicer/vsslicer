// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'test',
  testMatch: '*.spec.ts',
  snapshotPathTemplate: '{testDir}/__snapshots__/{arg}{ext}', // SwiftShader output is the same on every OS
  reporter: [['list']],
  use: { launchOptions: { args: ['--disable-3d-apis', '--disable-gpu'] } },
});
