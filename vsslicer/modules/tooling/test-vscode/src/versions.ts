// SPDX-License-Identifier: AGPL-3.0-or-later
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
