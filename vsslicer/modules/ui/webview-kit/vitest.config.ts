// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig, mergeConfig } from 'vitest/config';
import base from '@vsslicer/tooling/vitest';

// test/integration runs inside VS Code (pnpm test:integration), not in vitest.
export default mergeConfig(base, defineConfig({ test: { exclude: ['node_modules', 'test/integration/**'] } }));
