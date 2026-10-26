// SPDX-License-Identifier: AGPL-3.0-or-later
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';
import { FDM_XML_LIMITS, readFdmMaterialFolder, readFdmMaterials } from '../src/adapters/materials/fdm-material.ts';

const enc = new TextEncoder();
const xml = (body: string, head = '') =>
  `<?xml version="1.0"?>${head}<fdmmaterial xmlns="http://www.ultimaker.com/material" xmlns:cura="http://www.ultimaker.com/cura" version="1.3">${body}</fdmmaterial>`;
const GOOD = (guid = 'g1', extra = '') =>
  xml(`<metadata><name><brand>Acme</brand><material>PLA</material><color>Red</color></name><GUID>${guid}</GUID><color_code>#ff0000</color_code><cura:pva_compatible>True</cura:pva_compatible></metadata>
<properties><density>1.24</density><diameter>1.75</diameter></properties>
<settings><setting key="print temperature">200</setting><setting key="weird key">x</setting>${extra}
<machine><machine_identifier manufacturer="A" product="b"/><setting key="print temperature">180</setting><hotend id="h"><setting key="print cooling">5</setting></hotend></machine></settings>`);
const f = (path: string, text: string) => ({ path, bytes: enc.encode(text) });

describe('readFdmMaterials', () => {
  test('maps fields and settings; machine blocks do not leak; unmapped keys go to native', () => {
    const r = readFdmMaterials([f('a.xml.fdm_material', GOOD())]);
    expect(r.diagnostics).toEqual([]);
    expect(r.materials[0]).toMatchObject({
      vendor: 'Acme',
      brand: 'Acme',
      type: 'PLA',
      name: 'Acme Red PLA',
      diameter: 1.75,
      density: 1.24,
      color: '#ff0000',
      external_ids: { cura_guid: 'g1' },
      settings: { 'cura.default_material_print_temperature': 200 },
    });
    expect(Object.keys(r.materials[0]!.settings!)).toEqual(['cura.default_material_print_temperature']);
    expect(r.native[r.materials[0]!.id]).toEqual({ settings: { 'weird key': 'x' } });
  });

  test('names follow Cura: label wins, Generic colour is omitted', () => {
    const name = (body: string) =>
      readFdmMaterials([f('a.xml.fdm_material', GOOD().replace('<color>Red</color>', body))]).materials[0]!.name;
    expect(name('<color>Generic</color>')).toBe('Acme PLA');
    expect(name('<color>Red</color><label>Fancy Red</label>')).toBe('Acme Fancy Red');
  });

  test('CDATA text reaches the value', () => {
    const r = readFdmMaterials([
      f('a.xml.fdm_material', GOOD().replace('<GUID>g1</GUID>', '<GUID><![CDATA[g1]]></GUID>')),
    ]);
    expect(r.diagnostics).toEqual([]);
    expect(r.materials[0]!.external_ids).toEqual({ cura_guid: 'g1' });
    const long = GOOD().replace(
      '<GUID>g1</GUID>',
      `<GUID><![CDATA[${'g'.repeat(FDM_XML_LIMITS.maxTextBytes + 1)}]]></GUID>`,
    );
    expect(readFdmMaterials([f('b.xml.fdm_material', long)]).diagnostics[0]!.message).toMatch(/too long/);
  });

  test('a malformed or incomplete file is a diagnostic and the rest import; a repeated GUID is refused', () => {
    const r = readFdmMaterials([
      f('bad.xml.fdm_material', '<fdmmaterial><metadata></fdmmaterial>'),
      f('empty.xml.fdm_material', ''),
      f(
        'nodiam.xml.fdm_material',
        xml('<metadata><name><brand>A</brand><material>B</material></name><GUID>x</GUID></metadata>'),
      ),
      f('ok.xml.fdm_material', GOOD('g1')),
      f('dup.xml.fdm_material', GOOD('g1')),
    ]);
    expect(r.materials).toHaveLength(1);
    expect(r.diagnostics.map((d) => d.file)).toEqual([
      'bad.xml.fdm_material',
      'empty.xml.fdm_material',
      'nodiam.xml.fdm_material',
      'dup.xml.fdm_material',
    ]);
  });
});

describe('hostile XML (rule 25)', () => {
  const one = (text: string, limits = {}) => readFdmMaterials([f('h.xml.fdm_material', text)], limits);
  test('a DOCTYPE with entities (billion laughs, external) is refused, never expanded', () => {
    const bomb = `<!DOCTYPE x [<!ENTITY a "aaaaaaaaaa"><!ENTITY b "&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;">]>`;
    for (const head of [bomb, '<!DOCTYPE x SYSTEM "file:///etc/passwd">']) {
      const r = one(GOOD().replace('<fdmmaterial', `${head}<fdmmaterial`));
      expect(r.materials).toEqual([]);
      expect(r.diagnostics[0]!.message).toMatch(/DOCTYPE/);
    }
    // An undeclared entity reference is an XML error, not text.
    expect(one(GOOD().replace('Acme', '&xxe;')).materials).toEqual([]);
  });
  test('depth, element count and text length are capped', () => {
    const deep = '<a>'.repeat(FDM_XML_LIMITS.maxDepth + 1) + '</a>'.repeat(FDM_XML_LIMITS.maxDepth + 1);
    expect(one(xml(deep)).diagnostics[0]!.message).toMatch(/deeper/);
    const wide = '<a/>'.repeat(FDM_XML_LIMITS.maxElements);
    expect(one(xml(wide)).diagnostics[0]!.message).toMatch(/elements/);
    const long = GOOD().replace('Acme', 'A'.repeat(FDM_XML_LIMITS.maxTextBytes + 1));
    expect(one(long).diagnostics[0]!.message).toMatch(/too long/);
  });
  test('byte, file-count and total caps are enforced over all files of one call', () => {
    const g = GOOD();
    expect(one(g, { maxFileBytes: 100 }).diagnostics[0]!.message).toMatch(/byte limit/);
    const many = [1, 2, 3].map((i) => f(`${i}.xml.fdm_material`, GOOD(`g${i}`)));
    expect(readFdmMaterials(many, { maxFiles: 2 }).materials).toHaveLength(2);
    expect(readFdmMaterials(many, { maxTotalBytes: g.length * 2 }).materials).toHaveLength(2);
    expect(() => readFdmMaterials(many, { maxFiles: Infinity })).toThrow(RangeError);
  });
});

describe('readFdmMaterialFolder', () => {
  const dirs: string[] = [];
  afterAll(() => Promise.all(dirs.map((d) => rm(d, { recursive: true, force: true }))));
  test('reads flat files, skips dot files, subfolders and links', async () => {
    const d = await mkdtemp(join(tmpdir(), 'fdm-'));
    dirs.push(d);
    await writeFile(join(d, 'a.xml.fdm_material'), GOOD('g1'));
    await writeFile(join(d, '.h.xml.fdm_material'), GOOD('g2'));
    await writeFile(join(d, 'note.txt'), 'x');
    await mkdir(join(d, 'sub'));
    await writeFile(join(d, 'sub', 'c.xml.fdm_material'), GOOD('g3'));
    await writeFile(join(d, 'outside'), GOOD('g4'));
    await symlink(join(d, 'outside'), join(d, 'l.xml.fdm_material'));
    const r = await readFdmMaterialFolder(d);
    expect(r.materials.map((m) => m.external_ids!.cura_guid)).toEqual(['g1']);
    const capped = await readFdmMaterialFolder(d, { maxFiles: 2 });
    expect(capped.diagnostics.map((x) => x.message)).toEqual([expect.stringMatching(/more than 2 entries/)]);
    expect(await readFdmMaterialFolder(join(d, 'nope'))).toMatchObject({
      materials: [],
      diagnostics: [{ code: 'unreadable-folder' }],
    });
  });
});

const REPO = new URL('../../../../.reference/repos/fdm_materials/', import.meta.url).pathname;
describe.skipIf(!existsSync(REPO))('fdm_materials@0c05969', () => {
  test('every XML file yields exactly one material', async () => {
    const { readdirSync } = await import('node:fs');
    const n = readdirSync(REPO).filter((x) => x.endsWith('.xml.fdm_material')).length;
    const r = await readFdmMaterialFolder(REPO);
    expect(r.diagnostics).toEqual([]);
    expect(r.materials).toHaveLength(n);
    expect(n).toBeGreaterThan(250);
    for (const m of r.materials) {
      expect(m.external_ids?.cura_guid).toBeTruthy();
      expect(m.brand && m.type && m.density && m.diameter).toBeTruthy();
    }
  });
});

describe('a setting named __proto__', () => {
  test('is kept in native settings', () => {
    const r = readFdmMaterials([f('p.xml.fdm_material', GOOD('g1', '<setting key="__proto__">9</setting>'))]);
    expect(Object.keys(Object.values(r.native)[0]!.settings)).toContain('__proto__');
  });
});
