// SPDX-License-Identifier: AGPL-3.0-or-later
import { mkdtempSync, mkdirSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { build } from 'esbuild';
import { expect, test } from 'vitest';
import { TRANSPORT_SCHEMA_VERSION as host } from '../src/host/index.ts';
import { TRANSPORT_SCHEMA_VERSION as webview } from '../src/webview/index.ts';
import { TRANSPORT_SCHEMA_VERSION as gl } from '../src/gl/index.ts';

test('every entry exports the same schema version', () => {
  expect([host, webview, gl]).toEqual([1, 1, 1]);
});

// A scratch consumer resolves the package through its exports map, as an extension would (needs `pnpm build`).
const root = mkdtempSync(join(tmpdir(), 'webview-kit-consumer-'));
mkdirSync(join(root, 'node_modules/@vsslicer'), { recursive: true });
symlinkSync(resolve(import.meta.dirname, '..'), join(root, 'node_modules/@vsslicer/webview-kit'));

test.each([
  ['host', 'node'],
  ['webview', 'browser'],
  ['gl', 'browser'],
  ['testing', 'node'],
] as const)('entry %s bundles with esbuild for %s without vscode', async (entry, platform) => {
  const file = join(root, `${entry}.ts`);
  writeFileSync(
    file,
    `import { TRANSPORT_SCHEMA_VERSION } from '@vsslicer/webview-kit/${entry}';\nconsole.log(TRANSPORT_SCHEMA_VERSION);\n`,
  );
  const r = await build({
    entryPoints: [file],
    bundle: true,
    platform,
    format: 'esm',
    write: false,
    metafile: true,
    logLevel: 'silent',
  });
  expect(r.outputFiles[0]?.text).toContain('TRANSPORT_SCHEMA_VERSION');
  expect(Object.keys(r.metafile.inputs).join()).not.toContain('vscode');
});
