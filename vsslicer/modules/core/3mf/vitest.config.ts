// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig, mergeConfig } from 'vitest/config';
import base from '@vsslicer/tooling/vitest';

export default mergeConfig(base, defineConfig({}));
