// SPDX-License-Identifier: AGPL-3.0-only
import shared from '@vsslicer/tooling/eslint';

// The generator in tools/ is dev-only (not in `files`): it may import profile-api's types from devDependencies.
export default [
  ...shared,
  {
    files: ['tools/**'],
    rules: { 'import-x/no-extraneous-dependencies': ['error', { devDependencies: true, includeTypes: true }] },
  },
];
