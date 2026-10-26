// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from 'vitest';
import {
  CorruptZipError,
  MalformedXmlError,
  MissingProductionPartError,
  MissingRootModelError,
  SizeCapExceededError,
  ThreeMfError,
  UnsupportedRequiredExtensionError,
} from '../src/index.ts';
import type { Package } from '../src/index.ts';

test.each([
  [new CorruptZipError(), 'corrupt-zip', /zip/],
  [new MissingRootModelError(), 'missing-root-model', /root 3D model/],
  [new MalformedXmlError('3D/3dmodel.model', 'line 3'), 'malformed-xml', /3D\/3dmodel\.model.*line 3/],
  [new UnsupportedRequiredExtensionError('x'), 'unsupported-required-extension', /"x"/],
  [new SizeCapExceededError('The model', 100), 'size-cap-exceeded', /The model.*100/],
  [new MissingProductionPartError('/3D/o.model'), 'missing-production-part', /\/3D\/o\.model/],
])('%s has a code and a user message', (e, code, message) => {
  expect(e).toBeInstanceOf(ThreeMfError);
  expect(e).toBeInstanceOf(Error);
  expect(e.code).toBe(code);
  expect(e.userMessage).toMatch(message);
  expect(e.message).toBe(e.userMessage);
});

test('cause is kept', () => {
  const cause = new Error('inflate');
  expect(new CorruptZipError({ cause }).cause).toBe(cause);
});

test('a Part carries name, content type, relationships and bytes', () => {
  const pkg: Package = {
    rootModel: '3D/3dmodel.model',
    parts: [
      {
        name: '3D/3dmodel.model',
        contentType: 'x',
        relationships: [{ id: 'r1', type: 't', target: 'a', external: false }],
        bytes: new Uint8Array(1),
      },
    ],
  };
  expect(pkg.parts[0]?.relationships[0]?.id).toBe('r1');
});
