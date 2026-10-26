// SPDX-License-Identifier: AGPL-3.0-or-later
import base from '@vsslicer/tooling/eslint';

export default [
  ...base,
  // the bench is a dev script: its tokeniser libraries are dev dependencies on purpose
  { files: ['bench/**'], rules: { 'import-x/no-extraneous-dependencies': 'off' } },
];
