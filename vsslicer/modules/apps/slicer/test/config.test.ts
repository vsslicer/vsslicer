// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { createSettingsReader } from '../src/presentation/config.ts';

const reader = (values: Record<string, unknown>) => {
  const problems: string[] = [];
  return {
    read: createSettingsReader(
      (k) => values[k],
      (p) => problems.push(p),
    ),
    problems,
  };
};

test('reads each setting', () => {
  const { read, problems } = reader({
    engine: 'cura',
    'orca.path': '/o',
    'cura.path': '/c',
    timeout: 30,
    outputFolder: 'out',
  });
  assert.deepStrictEqual(read(), {
    engine: 'cura',
    orcaPath: '/o',
    curaPath: '/c',
    timeoutSeconds: 30,
    outputFolder: 'out',
  });
  assert.deepStrictEqual(problems, []);
});

test('defaults when unset', () => {
  assert.deepStrictEqual(reader({}).read(), {
    engine: 'orca',
    orcaPath: '',
    curaPath: '',
    timeoutSeconds: 600,
    outputFolder: '.vsslicer/sliced',
  });
});

test('invalid values fall back and are reported once', () => {
  const { read, problems } = reader({ engine: 'x', timeout: -5, 'orca.path': 3 });
  const s = read();
  read();
  assert.strictEqual(s.engine, 'orca');
  assert.strictEqual(s.timeoutSeconds, 600);
  assert.strictEqual(s.orcaPath, '');
  assert.strictEqual(problems.length, 3);
});

test('timeout is bounded to what runProcess accepts', () => {
  const cases: [number, number, number][] = [
    [Number.NaN, 600, 1],
    [Infinity, 600, 1],
    [-1, 600, 1],
    [0, 600, 1],
    [1.0005, 1, 1],
    [3_000_000, 2_147_483, 1],
    [2_147_483, 2_147_483, 0],
    [0.3, 1, 1],
  ];
  for (const [input, want, warnings] of cases) {
    const { read, problems } = reader({ engine: 'orca', timeout: input });
    const got = read().timeoutSeconds;
    assert.strictEqual(got, want, String(input));
    assert.ok(Number.isInteger(got * 1000) && got * 1000 <= 2 ** 31 - 1, String(input));
    assert.strictEqual(problems.length, warnings, String(input));
  }
});

test('package.json contributes every setting with default, description and scope', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
    contributes: {
      configuration: { properties: Record<string, { default: unknown; description: string; scope: string }> };
    };
  };
  const props = pkg.contributes.configuration.properties;
  for (const k of ['engine', 'orca.path', 'cura.path', 'timeout', 'outputFolder']) {
    const p = props[`vsslicer.slicer.${k}`];
    assert.ok(p && p.description && p.scope && p.default !== undefined, k);
  }
  assert.strictEqual(props['vsslicer.slicer.outputFolder']!.default, '.vsslicer/sliced');
  assert.strictEqual(props['vsslicer.slicer.orca.path']!.scope, 'machine');
});
