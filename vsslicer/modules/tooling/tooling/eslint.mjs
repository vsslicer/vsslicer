// SPDX-License-Identifier: AGPL-3.0-or-later
// Shared flat ESLint config. Consumers: eslint.config.mjs = `export { default } from '@vsslicer/tooling/eslint';`
import js from '@eslint/js';
import { closeSync, existsSync, openSync, readSync } from 'node:fs';
import { dirname, join } from 'node:path';
import boundaries from 'eslint-plugin-boundaries';
import { importX } from 'eslint-plugin-import-x';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const prefix = '// SPDX-License-Identifier: ';
const orLater = 'AGPL-3.0-or-later';
const cap = 1024 * 1024;
const licences = new Map();
// The header must match the nearest package.json `license` (AGPL-3.0-only or or-later); anything else expects or-later.
const licenceFor = (dir) => {
  if (licences.has(dir)) return licences.get(dir);
  let id;
  const file = join(dir, 'package.json');
  if (existsSync(file)) {
    const fd = openSync(file, 'r');
    try {
      const buf = Buffer.alloc(cap + 1);
      const n = readSync(fd, buf, 0, cap + 1, 0);
      if (n <= cap) id = JSON.parse(buf.toString('utf8', 0, n)).license;
    } catch {
      id = undefined;
    } finally {
      closeSync(fd);
    }
  } else if (dirname(dir) !== dir) id = licenceFor(dirname(dir));
  if (id !== 'AGPL-3.0-only') id = orLater;
  licences.set(dir, id);
  return id;
};
const spdx = {
  rules: {
    header: {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          missing: `First comment must be "${prefix}<the package's AGPL-3.0-only or AGPL-3.0-or-later>" (after a shebang).`,
        },
      },
      create: (context) => ({
        Program: (node) => {
          const text = context.sourceCode.text;
          const lines = text.split('\n');
          if (lines[0]?.startsWith('#!')) lines.shift();
          if (lines[0]?.trimEnd() !== prefix + licenceFor(dirname(context.filename)))
            context.report({ node, loc: { line: 1, column: 0 }, messageId: 'missing' });
        },
      }),
    },
  },
};

const layers = ['domain', 'application', 'adapters', 'presentation'];
const outer = { domain: layers.slice(1), application: layers.slice(2), adapters: layers.slice(3) };

export default [
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,mjs,js}'],
    languageOptions: { globals: globals.node },
    plugins: { spdx, boundaries, 'import-x': importX },
    settings: {
      'import-x/core-modules': ['vscode'],
      'boundaries/elements': layers.map((type) => ({ type, pattern: `**/src/${type}/**`, partialMatch: false })),
    },
    rules: {
      'spdx/header': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'import-x/no-extraneous-dependencies': [
        'error',
        { devDependencies: ['**/test/**', '**/*.config.{ts,mjs,js}'], includeTypes: true },
      ],
      'boundaries/dependencies': [
        'error',
        {
          default: 'allow',
          policies: Object.entries(outer).map(([from, to]) => ({
            from: { element: { type: from } },
            disallow: { to: { element: { types: { anyOf: to } } } },
          })),
        },
      ],
      'no-restricted-imports': [
        'error',
        { paths: [{ name: 'vscode', message: 'The VS Code API is only allowed in src/presentation.' }] },
      ],
    },
  },
  { files: ['**/src/presentation/**'], rules: { 'no-restricted-imports': 'off' } },
];
