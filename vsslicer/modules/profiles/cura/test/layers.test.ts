// SPDX-License-Identifier: AGPL-3.0-or-later
import { ESLint } from 'eslint';
import { join } from 'node:path';
import { expect, test } from 'vitest';

const cwd = join(import.meta.dirname, '..');
const eslint = new ESLint({ cwd });
const rules = async (code: string, file: string) => {
  const [r] = await eslint.lintText(code, { filePath: join(cwd, file) });
  return r!.messages.map((m) => m.ruleId);
};
const header = '// SPDX-License-Identifier: AGPL-3.0-or-later\n';

test('domain importing application fails the layer lint', async () => {
  expect(await rules(`${header}export * from '../application/index.ts';\n`, 'src/domain/violation.ts')).toEqual([
    'boundaries/dependencies',
  ]);
});

test('application importing domain passes', async () => {
  expect(await rules(`${header}export * from '../domain/index.ts';\n`, 'src/application/ok.ts')).toEqual([]);
});
