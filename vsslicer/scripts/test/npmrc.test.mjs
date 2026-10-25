// SPDX-License-Identifier: AGPL-3.0-or-later
// Every module (and the phantom-dep fixture) keeps pnpm's strict, non-hoisting node_modules layout.
// pnpm 11 defaults checked: no shamefully-hoist, node-linker=isolated, public-hoist-pattern empty. We assert the settings are
// not loosened in .npmrc or pnpm-workspace.yaml, and that an installed node_modules holds only the declared dependencies.
import test from 'node:test';
import assert from 'node:assert';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');
const projects = [
  ...readdirSync(join(root, 'modules')).map((d) => join(root, 'modules', d)),
  join(root, 'fixtures', 'phantom-dep'),
].filter((d) => existsSync(join(d, 'package.json')));

// key (kebab or camelCase) with a value that loosens isolation; setting them to the strict value is fine
const loose = /^\s*(shamefully-?hoist\s*[=:]\s*true|node-?linker\s*[=:]\s*(hoisted|pnp)|public-?hoist-?pattern(\[\])?\s*[=:]\s*\S)/im;
const looseYaml = /^\s*(shamefullyHoist:\s*true|nodeLinker:\s*(hoisted|pnp)|publicHoistPattern:\s*(\S|\n\s+-))/im;

test('the project list is not empty', () => assert.ok(projects.length >= 5));

for (const dir of projects) {
  const name = dir.slice(root.length + 1);
  test(`${name}: pnpm settings stay strict`, () => {
    for (const [file, re] of [['.npmrc', loose], ['pnpm-workspace.yaml', looseYaml]]) {
      const p = join(dir, file);
      if (!existsSync(p)) continue;
      const text = readFileSync(p, 'utf8').replace(/^\s*[#;].*$/gm, '');
      assert.doesNotMatch(text, re, `${name}/${file} loosens pnpm's strict layout`);
    }
  });

  test(`${name}: node_modules holds only declared dependencies`, (t) => {
    const nm = join(dir, 'node_modules');
    if (!existsSync(nm)) return t.skip('not installed');
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
    const declared = new Set(Object.keys({ ...pkg.dependencies, ...pkg.devDependencies, ...pkg.optionalDependencies, ...pkg.peerDependencies }));
    const top = readdirSync(nm).flatMap((e) => (e.startsWith('@') ? readdirSync(join(nm, e)).map((s) => `${e}/${s}`) : [e]));
    const extra = top.filter((e) => !e.startsWith('.') && !declared.has(e));
    assert.deepStrictEqual(extra, [], `${name} has hoisted packages it does not declare`);
  });
}
