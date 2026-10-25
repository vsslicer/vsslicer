// SPDX-License-Identifier: AGPL-3.0-or-later
import base from '@vsslicer/tooling/eslint';

// runner.cjs runs inside the VS Code extension host and has to be CommonJS.
export default [
  ...base,
  { ignores: ['.vscode-test', 'test-results'] }, // downloaded VS Code and run artefacts
  {
    files: ['runner.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { require: 'readonly', exports: 'writable', process: 'readonly' },
    },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
];
