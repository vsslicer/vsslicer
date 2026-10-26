// SPDX-License-Identifier: AGPL-3.0-or-later
import base from '@vsslicer/tooling/eslint';

export default [
  ...base,
  { ignores: ['.vscode-test', 'test-results', 'dist-test', '.cache'] }, // downloaded VS Code and run artefacts
  // bench tooling runs from the source tree (never published) and uses the dev dependencies
  { files: ['bench/**'], rules: { 'import-x/no-extraneous-dependencies': 'off' } },
  // suites that run inside VS Code: mocha globals, and the real `vscode` import
  {
    files: ['test/integration/**'],
    rules: { 'no-restricted-imports': 'off' },
    languageOptions: {
      globals: { describe: 'readonly', it: 'readonly', before: 'readonly', after: 'readonly', afterEach: 'readonly' },
    },
  },
];
