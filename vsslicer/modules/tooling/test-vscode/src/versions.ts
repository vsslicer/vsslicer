// SPDX-License-Identifier: AGPL-3.0-or-later
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

/** `min` is the lowest version `engines.vscode` allows; anything else is a literal version or `stable`/`insiders`. */
export const resolveVersion = (spec: string, enginesVscode: string): string => {
  if (spec !== 'min') return spec;
  const m = /^(?:\^|~|>=|=)?\s*(\d+\.\d+\.\d+)$/.exec(enginesVscode.trim());
  if (!m?.[1]) throw new Error(`cannot derive the minimum VS Code version from engines.vscode "${enginesVscode}"`);
  return m[1];
};

/** One download directory per version, so CI can cache `<cacheRoot>` keyed on the version list. */
export const cachePath = (cacheRoot: string, version: string): string => join(cacheRoot, version);

/** Results and logs of one run: `<resultsRoot>/<version>/`. */
export const resultsPath = (resultsRoot: string, version: string): string => join(resultsRoot, version);

/** Shared by every module on the machine: `VSCODE_TEST_CACHE`, else `%LOCALAPPDATA%\vsslicer\vscode-test` (Windows) or `~/.cache/vsslicer/vscode-test`. */
export const defaultCacheDir = (env: NodeJS.ProcessEnv, platform: NodeJS.Platform, home: string): string => {
  if (env['VSCODE_TEST_CACHE']) return env['VSCODE_TEST_CACHE'];
  const base = platform === 'win32' && env['LOCALAPPDATA'] ? env['LOCALAPPDATA'] : join(home, '.cache');
  return join(base, 'vsslicer', 'vscode-test');
};

/** The bundled mocha runner next to the compiled module; `.pathname` would keep `%20` and a `/C:/` prefix. */
export const runnerPath = (moduleUrl: string, windows?: boolean): string =>
  fileURLToPath(new URL('../runner.cjs', moduleUrl), { windows });
