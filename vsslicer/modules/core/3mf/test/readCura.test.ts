// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, test } from 'vitest';
import { createCuraReader } from '../src/adapters/cura/readCura.ts';
import { readProject as readCore } from '../src/adapters/model/resolveProject.ts';
import { readModel } from '../src/adapters/model/readModel.ts';
import { createReadProject } from '../src/application/readProject.ts';
import type { Package } from '../src/domain/package.ts';
import { triangleModel } from './support/minimalPackage.ts';

const enc = new TextEncoder();
const part = (name: string, text: string) => ({ name, contentType: 'x', relationships: [], bytes: enc.encode(text) });
const model = part('3D/3dmodel.model', triangleModel);
const curaParts = [
  part('Cura/preferences.cfg', '[general]\nversion = 7\n'),
  part('Cura/my_machine.global_stack.cfg', '[general]\nname = M\n'),
  part('Cura/version.ini', '[versions]\ncura_version = 5.9\n'),
  part('Cura/nested/x.cfg', 'x'),
  part('Metadata/thumbnail.png', 'png'),
];
const pkg = (parts: Package['parts']): Package => ({ rootModel: model.name, parts });
const run = createReadProject({
  readCore,
  readMetadata: (p) => readModel(p.parts[0]!.bytes, p.rootModel).metadata,
  readers: new Map([['cura', createCuraReader(readCore)]]),
});

describe('cura reader', () => {
  const p = pkg([model, ...curaParts]);
  const out = run(p);

  test('containers are returned raw and byte-equal to the parts', () => {
    expect([...out.rawConfig.keys()]).toEqual(['Cura/preferences.cfg', 'Cura/my_machine.global_stack.cfg']);
    expect(out.rawConfig.get('Cura/preferences.cfg')).toBe(curaParts[0]!.bytes);
    expect(out.rawConfig.get('Cura/my_machine.global_stack.cfg')).toBe(curaParts[1]!.bytes);
  });

  test('objects and instances match the core read', () => {
    const core = readCore(p);
    expect(out.dialect).toBe('cura');
    expect(out.objects).toEqual(core.objects);
    expect(out.instances).toEqual(core.instances);
    expect(out.objects).toHaveLength(1);
  });

  test('other non-model parts are preserved, containers are not', () => {
    expect(out.preserved.map((x) => x.name)).toEqual([
      'Cura/version.ini',
      'Cura/nested/x.cfg',
      'Metadata/thumbnail.png',
    ]);
  });

  test('a plain Cura model 3MF without Cura/ parts opens as core', () => {
    const plain = run(pkg([model]));
    expect(plain.dialect).toBe('core');
    expect(plain.rawConfig.size).toBe(0);
    expect(plain.objects).toHaveLength(1);
  });
});
