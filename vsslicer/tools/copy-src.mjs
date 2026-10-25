// SPDX-License-Identifier: AGPL-3.0-or-later
// Placeholder build until PLT-3 adds the TypeScript compiler: copies src to dist.
import { cpSync, rmSync } from 'node:fs';
rmSync('dist', { recursive: true, force: true });
cpSync('src', 'dist', { recursive: true });
