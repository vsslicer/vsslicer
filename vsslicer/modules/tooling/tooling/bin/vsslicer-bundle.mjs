#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later
// Usage: vsslicer-bundle [entry] [outfile]   (defaults: src/presentation/extension.ts dist/extension.js)
// Bundles a VS Code extension for the extension host: one CommonJS file, `vscode` left external.
import { realpathSync } from 'node:fs';
import { build } from 'esbuild';

export const bundle = (entry = 'src/presentation/extension.ts', outfile = 'dist/extension.js') =>
  build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node24',
    external: ['vscode'],
    sourcemap: true,
    logLevel: 'info',
  });

// argv[1] is the node_modules/.bin symlink when run as a bin
if (import.meta.filename === realpathSync(process.argv[1])) await bundle(...process.argv.slice(2));
