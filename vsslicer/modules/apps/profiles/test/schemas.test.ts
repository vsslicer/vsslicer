// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';
import assert from 'node:assert';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { allSchemas } from '@vsslicer/profile-api';
import { SCHEMA_BASE, fileName, toFile } from '../scripts/schema-files.ts';

const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  files: string[];
  contributes: { jsonValidation: { fileMatch: string; url: string }[] };
};

// Undo the one documented difference: `./name.json` strings become the published absolute URLs again.
const unlocalise = (v: unknown): unknown =>
  typeof v === 'string'
    ? v.replace(/^\.\//, SCHEMA_BASE)
    : Array.isArray(v)
      ? v.map(unlocalise)
      : v && typeof v === 'object'
        ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, unlocalise(x)]))
        : v;

test('the shipped schema files are the published profile-api schemas (hash and content)', () => {
  assert.ok(allSchemas.length >= 9);
  for (const s of allSchemas) {
    const shipped = readFileSync(new URL(`../schemas/${fileName(s)}`, import.meta.url));
    assert.strictEqual(sha(shipped), sha(toFile(s)), `${s.$id} differs; run pnpm sync-schemas`);
    assert.deepStrictEqual(unlocalise(JSON.parse(shipped.toString())), JSON.parse(JSON.stringify(s)));
  }
});

test('every entity schema is contributed once, its file ships, and no url leaves the module', () => {
  const entities = allSchemas.filter((s) => !(s.$id as string).endsWith('/defs.json'));
  const urls = pkg.contributes.jsonValidation.map((v) => v.url).sort();
  assert.deepStrictEqual(urls, entities.map((s) => `./schemas/${fileName(s)}`).sort());
  assert.ok(pkg.contributes.jsonValidation.every((v) => v.fileMatch.includes('.vsslicer/profiles/')));
  assert.ok(pkg.files.includes('schemas'));
});

test('every jsonValidation url is let through by a .vscodeignore allow rule', () => {
  const allows = readFileSync(new URL('../.vscodeignore', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.startsWith('!'))
    // shortcut: only `*` globs, which is all this file uses; upgrade if a `**` allow appears
    .map(
      (l) =>
        new RegExp(
          `^${l
            .slice(1)
            .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
            .replace(/\*/g, '[^/]*')}$`,
        ),
    );
  for (const { url } of pkg.contributes.jsonValidation) {
    const path = url.replace(/^\.\//, '');
    assert.ok(
      allows.some((r) => r.test(path)),
      `${path} is not allowed in .vscodeignore, so it would be missing from the VSIX`,
    );
  }
});
