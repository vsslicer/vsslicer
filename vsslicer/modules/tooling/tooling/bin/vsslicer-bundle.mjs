#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later
// Usage: vsslicer-bundle [entry] [outfile]   (defaults: src/presentation/extension.ts dist/extension.js)
// Bundles a VS Code extension for the extension host: one CommonJS file, `vscode` left external.
import { realpathSync, writeFileSync } from 'node:fs';
import { build } from 'esbuild';

// Also writes the esbuild metafile next to the bundle (dist/extension.meta.json) for third-party-notices.
export const bundle = async (entry = 'src/presentation/extension.ts', outfile = 'dist/extension.js') => {
  const { metafile } = await build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node24',
    external: ['vscode'],
    sourcemap: true,
    metafile: true,
    logLevel: 'info',
  });
  writeFileSync(outfile.replace(/\.js$/, '.meta.json'), JSON.stringify(metafile));
};

// argv[1] is the node_modules/.bin symlink when run as a bin
if (import.meta.filename === realpathSync(process.argv[1])) await bundle(...process.argv.slice(2));
