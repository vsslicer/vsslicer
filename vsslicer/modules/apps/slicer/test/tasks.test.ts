// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { TASK_KINDS, TASK_PROPERTIES, TASK_TYPE, validateTaskEntry } from '../src/presentation/tasks.ts';

const slice = {
  type: 'vsslicer',
  task: 'slice',
  label: 's',
  plate: 1,
  printerProfile: 'p',
  filamentProfile: 'f',
  processProfile: 'q',
};

test('package.json contributes the schema this code validates', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const def = pkg.contributes.taskDefinitions.find((d: { type: string }) => d.type === TASK_TYPE);
  const all = new Set(Object.values(TASK_PROPERTIES).flatMap((s) => [...s.required, ...s.optional]));
  assert.deepStrictEqual(Object.keys(def.properties).sort(), ['task', ...all].sort());
  assert.deepStrictEqual(def.properties.task.enum, [...TASK_KINDS]);
});

test('valid entries pass', () => {
  assert.deepStrictEqual(validateTaskEntry({ ...slice, engine: 'cura' }), { ok: true, kind: 'slice' });
  assert.deepStrictEqual(validateTaskEntry({ type: 'vsslicer', task: 'print', printer: 'x' }), {
    ok: true,
    kind: 'print',
  });
  assert.strictEqual(validateTaskEntry({ type: 'vsslicer', task: 'upload', printer: 'x', group: 'build' }).ok, true);
});

test('unknown properties, missing required and wrong kinds are rejected', () => {
  assert.strictEqual(validateTaskEntry({ ...slice, bogus: 1 }).ok, false);
  assert.strictEqual(validateTaskEntry({ type: 'vsslicer', task: 'print', printer: 'x', plate: 1 }).ok, false);
  assert.strictEqual(validateTaskEntry({ type: 'vsslicer', task: 'upload' }).ok, false);
  assert.strictEqual(validateTaskEntry({ ...slice, plate: 0 }).ok, false);
  assert.strictEqual(validateTaskEntry({ ...slice, engine: 'x' }).ok, false);
  assert.strictEqual(validateTaskEntry({ ...slice, task: 'nope' }).ok, false);
  for (const v of [null, 1, [], 'x', { type: 'shell' }]) assert.strictEqual(validateTaskEntry(v).ok, false);
});

test('hostile: huge strings and too many keys', () => {
  assert.strictEqual(validateTaskEntry({ ...slice, printerProfile: 'x'.repeat(100_000) }).ok, false);
  const many = Object.fromEntries(Array.from({ length: 1000 }, (_, i) => [`k${i}`, 1]));
  assert.strictEqual(validateTaskEntry({ ...slice, ...many }).ok, false);
});

test('common VS Code task keys are accepted', () => {
  const r = validateTaskEntry({
    type: 'vsslicer',
    task: 'print',
    printer: 'x',
    isBackground: true,
    promptOnClose: false,
    runOptions: { runOn: 'folderOpen' },
    dependsOrder: 'sequence',
    identifier: 'p',
    inAgents: true,
    hide: true,
    icon: { id: 'flame' },
    options: { cwd: '.' },
  });
  assert.strictEqual(r.ok, true);
});
