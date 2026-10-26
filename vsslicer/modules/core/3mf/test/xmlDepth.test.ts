// SPDX-License-Identifier: AGPL-3.0-or-later
import { SaxesParser } from 'saxes';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { readModel } from '../src/adapters/model/readModel.ts';
import { scanModel } from '../src/adapters/opc/modelScan.ts';
import { startTags } from '../src/adapters/opc/xml.ts';
import { MalformedXmlError } from '../src/index.ts';
import { coreNs } from './support/minimalPackage.ts';

const DEPTH = 10_000;
const enc = new TextEncoder();
const nested = (open: string, close: string): string => open.repeat(DEPTH) + close.repeat(DEPTH);

let opentags = 0;
const proto = SaxesParser.prototype as unknown as { on: (name: string, handler: (...a: unknown[]) => void) => unknown };
const realOn = proto.on;
beforeEach(() => {
  opentags = 0;
  proto.on = function (this: SaxesParser, name, handler) {
    return realOn.call(this, name, name === 'opentag' ? (...a) => (opentags++, handler(...a)) : handler);
  };
});
afterEach(() => {
  proto.on = realOn;
});

const parts: [string, (xml: string) => unknown][] = [
  ['[Content_Types].xml', (x) => startTags(enc.encode(x), '[Content_Types].xml')],
  ['_rels/.rels', (x) => startTags(enc.encode(x), '_rels/.rels')],
  ['scanModel', (x) => scanModel(enc.encode(x), '3D/3dmodel.model')],
  ['readModel', (x) => readModel(enc.encode(x), '3D/3dmodel.model')],
];

test.each(parts)('%s rejects 10,000-deep nesting after at most 65 opentag events', (_name, run) => {
  expect(() => run(`<root xmlns="${coreNs}">${nested('<a>', '</a>')}</root>`)).toThrow(MalformedXmlError);
  expect(opentags).toBeLessThanOrEqual(65);
});

test('startTags and scanModel accept nesting of exactly 64', () => {
  const xml = `<a>${'<b>'.repeat(63)}${'</b>'.repeat(63)}</a>`;
  expect(startTags(enc.encode(xml), 'p')).toHaveLength(64);
  expect(scanModel(enc.encode(xml), 'p').productionPaths).toEqual([]);
});
