// SPDX-License-Identifier: AGPL-3.0-or-later
// Shared vitest defaults: a plain object, so tooling needs no vitest dependency. Consumers wrap it:
//   import { defineConfig, mergeConfig } from 'vitest/config';
//   import base from '@vsslicer/tooling/vitest';
//   export default mergeConfig(base, defineConfig({}));
export default {
  test: {
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
    },
  },
};
