// SPDX-License-Identifier: AGPL-3.0-or-later
import { builtinModules } from 'node:module';
import shared from '@vsslicer/tooling/eslint';

// profile-api runs in any host (worker, webview, CLI): its source imports neither Node nor VS Code.
const message = 'profile-api source is host-free: no Node or VS Code imports.';
export default [
  ...shared,
  {
    files: ['src/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: ['vscode', ...builtinModules].map((name) => ({ name, message })),
          patterns: [{ group: ['node:*'], message }],
        },
      ],
    },
  },
];
