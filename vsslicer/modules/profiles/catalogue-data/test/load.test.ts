// SPDX-License-Identifier: AGPL-3.0-only
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import {
  CATALOGUE_LIMITS,
  CatalogueDataError,
  catalogueGroups,
  checkCatalogueJson,
  curaCatalogue,
  orcaCatalogue,
  parseCatalogueJson,
} from '../src/index.ts';

const DATA = join(import.meta.dirname, '../src/data');
const nested = (depth: number): unknown => {
  let value: unknown = {};
  for (let i = 1; i < depth; i += 1) value = { a: value };
  return value;
};

describe('the shipped data', () => {
  test.each(readdirSync(DATA))('%s parses within the limits', (file) => {
    const text = readFileSync(join(DATA, file), 'utf8');
    expect(parseCatalogueJson(text)).toEqual(JSON.parse(text));
  });

  test('exports the files profile-api reads today', () => {
    expect(Object.keys(orcaCatalogue['entries'] as object)).toHaveLength(804);
    expect(curaCatalogue['entries']).toBeTypeOf('object');
    expect(catalogueGroups).toEqual(JSON.parse(readFileSync(join(DATA, 'groups.json'), 'utf8')));
  });
});

describe('hostile input', () => {
  test('depth 32 passes, depth 33 fails', () => {
    expect(() => checkCatalogueJson(nested(32))).not.toThrow();
    expect(() => checkCatalogueJson(nested(33))).toThrow(CatalogueDataError);
  });

  test('deep nesting within the default parse size fails without a stack overflow', () => {
    const text = '['.repeat(200_000) + ']'.repeat(200_000);
    expect(() => checkCatalogueJson({ a: JSON.parse(text) })).toThrow(/deeper than 32/);
  });

  test('too many keys fails', () => {
    expect(() => checkCatalogueJson({ a: new Array(11).fill(0) }, { maxKeys: 10 })).toThrow(/more than 10 keys/);
    expect(() => checkCatalogueJson({ a: new Array(9).fill(0) }, { maxKeys: 10 })).not.toThrow();
  });

  test('text over the byte cap fails before parsing, counting UTF-8 bytes', () => {
    expect(() => parseCatalogueJson(' '.repeat(CATALOGUE_LIMITS.maxBytes + 1))).toThrow(/larger than/);
    expect(() => parseCatalogueJson('{"a":"ééé"}', { maxBytes: 12 })).toThrow(/larger than 12/);
    expect(parseCatalogueJson('{"a":"ééé"}', { maxBytes: 14 })).toEqual({ a: 'ééé' });
  });

  test.each(['[]', 'null', '1', '"x"', '{', ''])('%j is not a catalogue', (text) => {
    expect(() => parseCatalogueJson(text)).toThrow(CatalogueDataError);
  });

  test.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, CATALOGUE_LIMITS.maxDepth + 1])(
    'maxDepth %d is rejected',
    (maxDepth) => {
      expect(() => checkCatalogueJson({}, { maxDepth })).toThrow(RangeError);
    },
  );
});
