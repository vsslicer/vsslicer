// SPDX-License-Identifier: AGPL-3.0-or-later
import { mkdirSync, mkdtempSync, readFileSync, rmSync, createWriteStream } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { downloadAndUnzipVSCode, runTests } from '@vscode/test-electron';
import { cachePath, defaultCacheDir, resolveVersion, resultsPath } from './versions.ts';

export interface IntegrationOptions {
  /** The extension folder (its package.json supplies `engines.vscode`). */
  extensionDevelopmentPath: string;
  /** Folder of compiled `*.test.js` mocha files (CommonJS, `vscode` external). */
  testsDir: string;
  /** Defaults to the bundled mocha runner. */
  extensionTestsPath?: string;
  /** `min`, `stable`, `insiders` or an exact version. Default `['min', 'stable']`. */
  versions?: string[];
  /** Default `VSCODE_TEST_CACHE` or `~/.cache/vsslicer/vscode-test` (Windows: `%LOCALAPPDATA%\\vsslicer\\vscode-test`), shared by every module; one `<version>` folder inside per VS Code. */
  cacheDir?: string;
  /** Default `test-results/integration`; `<version>/junit.xml`, `console.log` and `logs/` inside. */
  resultsDir?: string;
}

/** Runs the suite on every version; resolves with the versions that failed. */
export const runIntegration = async (o: IntegrationOptions): Promise<string[]> => {
  const ext = resolve(o.extensionDevelopmentPath);
  const engines = (JSON.parse(readFileSync(join(ext, 'package.json'), 'utf8')) as { engines?: { vscode?: string } })
    .engines?.vscode;
  if (!engines) throw new Error(`${ext}/package.json has no engines.vscode`);
  const testsPath = o.extensionTestsPath ?? new URL('../runner.cjs', import.meta.url).pathname;
  // Set by VS Code terminals and Electron-hosted tools; it would make the downloaded VS Code behave as plain Node.
  delete process.env['ELECTRON_RUN_AS_NODE'];
  const failed: string[] = [];
  for (const spec of o.versions ?? ['min', 'stable']) {
    const version = resolveVersion(spec, engines);
    const results = resolve(resultsPath(o.resultsDir ?? 'test-results/integration', version));
    rmSync(results, { recursive: true, force: true });
    mkdirSync(results, { recursive: true });
    const tmp = mkdtempSync(join(tmpdir(), 'vsslicer-vscode-'));
    const cache = resolve(cachePath(o.cacheDir ?? defaultCacheDir(process.env, process.platform, homedir()), version));
    mkdirSync(cache, { recursive: true }); // test-electron only creates the last path segment
    const vscodeExecutablePath = await downloadAndUnzipVSCode({ version, cachePath: cache });
    // VS Code's stdout/stderr (including the renderer console) are forwarded to ours: keep a copy as an artefact.
    const log = createWriteStream(join(results, 'console.log'));
    const out = process.stdout.write.bind(process.stdout);
    const err = process.stderr.write.bind(process.stderr);
    process.stdout.write = ((c: string | Uint8Array, ...a: never[]) => (
      log.write(c),
      out(c, ...a)
    )) as typeof process.stdout.write;
    process.stderr.write = ((c: string | Uint8Array, ...a: never[]) => (
      log.write(c),
      err(c, ...a)
    )) as typeof process.stderr.write;
    console.log(`[test-vscode] VS Code ${version} (${spec}), results in ${results}`);
    try {
      await runTests({
        vscodeExecutablePath,
        extensionDevelopmentPath: ext,
        extensionTestsPath: testsPath,
        extensionTestsEnv: { VSSLICER_TESTS_DIR: resolve(o.testsDir), VSSLICER_JUNIT_FILE: join(results, 'junit.xml') },
        launchArgs: [
          '--disable-extensions',
          '--disable-workspace-trust',
          `--user-data-dir=${join(tmp, 'user-data')}`,
          `--extensions-dir=${join(tmp, 'extensions')}`,
          `--logsPath=${join(results, 'logs')}`,
        ],
      });
    } catch (e) {
      console.error(`[test-vscode] VS Code ${version} failed: ${e instanceof Error ? e.message : String(e)}`);
      failed.push(version);
    } finally {
      process.stdout.write = out as typeof process.stdout.write;
      process.stderr.write = err as typeof process.stderr.write;
      log.end();
      rmSync(tmp, { recursive: true, force: true });
    }
  }
  return failed;
};
