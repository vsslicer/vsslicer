// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { ESLint } from 'eslint';
import { check } from 'prettier';
import prettierConfig from '../prettier.config.mjs';

const fixtures = join(import.meta.dirname, 'fixtures/lint');
const eslint = new ESLint({
  cwd: join(import.meta.dirname, '..'),
  overrideConfigFile: join(import.meta.dirname, '../eslint.mjs'),
});
const rules = async (file) => {
  const [result] = await eslint.lintFiles(join(fixtures, file));
  return [...new Set(result.messages.map((m) => m.ruleId))];
};

const violations = {
  'no-spdx.ts': 'spdx/header',
  'unused-import.ts': '@typescript-eslint/no-unused-vars',
  'extraneous-dependency/index.ts': 'import-x/no-extraneous-dependencies',
  'layer-domain-imports-application/src/domain/y.ts': 'boundaries/dependencies',
  'layer-domain-imports-adapters/src/domain/y.ts': 'boundaries/dependencies',
  'layer-domain-imports-presentation/src/domain/y.ts': 'boundaries/dependencies',
  'layer-application-imports-adapters/src/application/y.ts': 'boundaries/dependencies',
  'layer-application-imports-presentation/src/application/y.ts': 'boundaries/dependencies',
  'vscode-in-domain/src/domain/y.ts': 'no-restricted-imports',
  'vscode-in-application/src/application/y.ts': 'no-restricted-imports',
  'vscode-in-adapters/src/adapters/y.ts': 'no-restricted-imports',
};
for (const [file, rule] of Object.entries(violations))
  test(`eslint fails ${file} with ${rule}`, async () => assert.deepStrictEqual(await rules(file), [rule]));

for (const file of ['clean.ts', 'clean-layers/src/presentation/y.ts', 'clean-layers/src/domain/x.ts'])
  test(`eslint passes ${file}`, async () => assert.deepStrictEqual(await rules(file), []));

const formatted = (file) =>
  check(readFileSync(join(fixtures, file), 'utf8'), { ...prettierConfig, filepath: join(fixtures, file) });
test('prettier fails the misformatted fixture', async () =>
  assert.strictEqual(await formatted('misformatted.ts'), false));
test('prettier passes the clean fixture', async () => assert.strictEqual(await formatted('clean.ts'), true));
