#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { runIntegration } from './run.ts';

const { values } = parseArgs({
  options: {
    extension: { type: 'string', default: '.' },
    tests: { type: 'string', default: 'dist-test' },
    versions: { type: 'string', default: 'min,stable' },
    'cache-dir': { type: 'string' },
    'results-dir': { type: 'string' },
  },
});

// Linux CI has no display: run again under xvfb (not installed here? `apt-get install xvfb`).
if (process.platform === 'linux' && !process.env['DISPLAY']) {
  const r = spawnSync('xvfb-run', ['-a', process.execPath, ...process.argv.slice(1)], {
    stdio: 'inherit',
    env: { ...process.env, DISPLAY: ':99' },
  });
  if (r.error) console.error(`[test-vscode] no DISPLAY and xvfb-run failed: ${r.error.message}`);
  process.exit(r.status ?? 1);
}

const failed = await runIntegration({
  extensionDevelopmentPath: values.extension,
  testsDir: values.tests,
  versions: values.versions.split(','),
  ...(values['cache-dir'] && { cacheDir: values['cache-dir'] }),
  ...(values['results-dir'] && { resultsDir: values['results-dir'] }),
});
process.exit(failed.length ? 1 : 0);
