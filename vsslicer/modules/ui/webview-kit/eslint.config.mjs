// SPDX-License-Identifier: AGPL-3.0-or-later
import base from '@vsslicer/tooling/eslint';

export default [
  ...base,
  { ignores: ['test-results', 'test/integration/fixture/webview.js', 'test/integration/fixture/tests'] },
  // suites that run inside VS Code: mocha globals, and the real `vscode` import
  {
    files: ['test/integration/**'],
    rules: { 'no-restricted-imports': 'off' },
    languageOptions: { globals: { describe: 'readonly', it: 'readonly' } },
  },
];
