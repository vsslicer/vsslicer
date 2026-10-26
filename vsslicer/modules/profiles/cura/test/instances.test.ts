// SPDX-License-Identifier: AGPL-3.0-or-later
import type { SourceFile } from '@vsslicer/profile-api';
import { describe, expect, test } from 'vitest';
import { readCuraMachineInstances } from '../src/adapters/instances/read.ts';

const file = (path: string, text: string): SourceFile => ({ path, bytes: new TextEncoder().encode(text) });
// Built from Uranium@e65ccc1 ContainerStack.serialize (no Cura app was available to save one).
const stack = (id: string, metadata: string, containers = '6 = ' + id + '_settings\n7 = printer_a') =>
  `[general]\nversion = 6\nname = ${id}\nid = ${id}\n\n[metadata]\ntype = machine\n${metadata}\n\n[containers]\n${containers}\n`;
const extruder = (id: string, machine: string, position: number) =>
  `[general]\nversion = 6\nname = e\nid = ${id}\n\n[metadata]\ntype = extruder_train\nmachine = ${machine}\nposition = ${position}\n\n[containers]\n6 = ${id}_settings\n7 = printer_a_extruder\n`;
const changes = (id: string, values: string) =>
  `[general]\nversion = 4\nname = ${id}\ndefinition = printer_a\n\n[metadata]\ntype = definition_changes\n\n[values]\n${values}\n`;
const base = [
  file('definition_changes/ex_settings.inst.cfg', changes('ex_settings', 'machine_nozzle_size = 0.6')),
  file('extruders/ex.extruder.cfg', extruder('ex', 'm1', 0)),
  file('extruders/ex1.extruder.cfg', extruder('ex1', 'm1', 1)),
];
const octo = 'octoprint_api_key = SECRET\noctoprint_url = http://octopi.local';

describe('readCuraMachineInstances', () => {
  test('keeps model, nozzle and host; the key travels beside the entity', () => {
    const files = [file('machine_instances/m1.global.cfg', stack('m1', octo)), ...base];
    const r = readCuraMachineInstances(files);
    expect(r.diagnostics).toEqual([]);
    expect(r.instances).toEqual([
      {
        entity: {
          id: 'm1',
          model: 'printer_a',
          toolheads: [{ slot: 0, nozzle: '0.6' }],
          connection: { host_type: 'octoprint', url: 'http://octopi.local', secret_ref: 'cura-machine/m1' },
        },
        credential: 'SECRET',
      },
    ]);
    expect(JSON.stringify(r.instances[0]!.entity)).not.toContain('SECRET');
    expect(JSON.stringify(r.native)).not.toContain('SECRET');
  });
  test('a quote_plus file name (space, %2B, unicode) finds its definition_changes', () => {
    for (const [name, id] of [
      ['Creality+Ender-3', 'Creality Ender-3'],
      ['a%2Bb+c', 'a+b c'],
      ['caf%C3%A9', 'café'],
    ] as const) {
      const r = readCuraMachineInstances([
        file(`machine_instances/${name}.global.cfg`, stack(id, '', `6 = ${id}_settings\n7 = printer_a`)),
        file(
          `definition_changes/${name}_settings.inst.cfg`,
          changes('', 'machine_nozzle_size = 0.6').replace('\nname = \n', '\n'),
        ),
      ]);
      expect(r.diagnostics).toEqual([]);
      expect(r.instances[0]!.entity.toolheads).toEqual([{ slot: 0, nozzle: '0.6' }]);
    }
  });
  test('a malformed escape in a file name stays as written, with + as space', () => {
    const r = readCuraMachineInstances([
      file('machine_instances/m%ZZ+x.global.cfg', stack('m%ZZ x', '', '6 = m%ZZ x_settings\n7 = printer_a')),
      file(
        'definition_changes/m%ZZ+x_settings.inst.cfg',
        changes('', 'machine_nozzle_size = 0.6').replace('\nname = \n', '\n'),
      ),
    ]);
    expect(r.instances[0]!.entity.toolheads).toEqual([{ slot: 0, nozzle: '0.6' }]);
  });
  test('only the position-0 extruder sets the nozzle', () => {
    const r = readCuraMachineInstances([
      file('machine_instances/m1.global.cfg', stack('m1', '')),
      file('definition_changes/ex1_settings.inst.cfg', changes('ex1_settings', 'machine_nozzle_size = 0.8')),
      file('extruders/ex1.extruder.cfg', extruder('ex1', 'm1', 1)),
      ...base,
    ]);
    expect(r.instances[0]!.entity.toolheads).toEqual([{ slot: 0, nozzle: '0.6' }]);
  });
  test('the source files are not modified', () => {
    const files = [file('machine_instances/m1.global.cfg', stack('m1', octo)), ...base];
    const before = files.map((f) => [...f.bytes]);
    readCuraMachineInstances(files);
    expect(files.map((f) => [...f.bytes])).toEqual(before);
  });
  test('an Ultimaker network machine gets a diagnostic and no connection', () => {
    const r = readCuraMachineInstances([file('machine_instances/m1.global.cfg', stack('m1', 'um_network_key = abc'))]);
    expect(r.instances[0]!.entity.connection).toBeUndefined();
    expect(r.instances[0]!.credential).toBeUndefined();
    expect(r.diagnostics.map((d) => d.code)).toContain('unknown-type');
  });
  test('an octoprint key without a url keeps no connection and no credential', () => {
    const r = readCuraMachineInstances([file('machine_instances/m1.global.cfg', stack('m1', 'octoprint_api_key = K'))]);
    expect(r.instances[0]).toEqual({ entity: { id: 'm1', model: 'printer_a', toolheads: [] } });
    expect(r.diagnostics.map((d) => d.code)).toContain('malformed-line');
  });
  test('a url without a key connects and warns credential-missing', () => {
    const r = readCuraMachineInstances([
      file('machine_instances/m1.global.cfg', stack('m1', 'octoprint_url = http://x')),
    ]);
    expect(r.instances[0]!.entity.connection?.url).toBe('http://x');
    expect(r.diagnostics.map((d) => d.code)).toContain('credential-missing');
  });
  test('an over-long url is refused', () => {
    const r = readCuraMachineInstances([
      file('machine_instances/m1.global.cfg', stack('m1', `octoprint_url = ${'u'.repeat(3000)}`)),
    ]);
    expect(r.instances[0]!.entity.connection).toBeUndefined();
  });
  test('nozzle: no size set leaves toolheads empty with a warning; the machine stack is the fallback', () => {
    const none = readCuraMachineInstances([file('machine_instances/m1.global.cfg', stack('m1', ''))]);
    expect(none.instances[0]!.entity.toolheads).toEqual([]);
    expect(none.diagnostics).toHaveLength(1);
    const own = readCuraMachineInstances([
      file('machine_instances/m1.global.cfg', stack('m1', '')),
      file('definition_changes/m1_settings.inst.cfg', changes('m1_settings', 'machine_nozzle_size = 0.25')),
    ]);
    expect(own.instances[0]!.entity.toolheads).toEqual([{ slot: 0, nozzle: '0.25' }]);
    const bad = readCuraMachineInstances([
      file('machine_instances/m1.global.cfg', stack('m1', '')),
      file('definition_changes/m1_settings.inst.cfg', changes('m1_settings', 'machine_nozzle_size = =foo')),
    ]);
    expect(bad.instances[0]!.entity.toolheads).toEqual([]);
  });
  test('malformed stacks give diagnostics, not entities', () => {
    const r = readCuraMachineInstances([
      file('machine_instances/a.global.cfg', stack('a', '').replace('version = 6', 'version = 5')),
      file('machine_instances/b.global.cfg', stack('b', '', '5 = v')),
      { path: 'machine_instances/c.global.cfg', bytes: new Uint8Array([0xff, 0xfe]) },
      file('machine_instances/d.global.cfg', stack('m1', '')),
      file('machine_instances/e.global.cfg', stack('m1', '')),
    ]);
    expect(r.instances.map((i) => i.entity.id)).toEqual(['m1']);
    expect(r.diagnostics.filter((d) => d.severity === 'error')).toHaveLength(3);
    expect(r.diagnostics.some((d) => d.severity === 'warning' && d.message.includes('same id'))).toBe(true);
  });
  test('bounds: file count, size and total, and a bad limit', () => {
    const f = file('machine_instances/m1.global.cfg', stack('m1', ''));
    expect(readCuraMachineInstances([f, f], { maxFiles: 1 }).diagnostics[0]!.message).toContain('more than 1 files');
    expect(readCuraMachineInstances([f], { maxFileBytes: 10 }).instances).toEqual([]);
    expect(readCuraMachineInstances([f, f], { maxTotalBytes: f.bytes.length + 1 }).diagnostics[0]!.message).toContain(
      'in all',
    );
    expect(() => readCuraMachineInstances([f], { maxFiles: 0 })).toThrow(RangeError);
  });
  test('a __proto__ machine id keeps its native entry', () => {
    const r = readCuraMachineInstances([file('machine_instances/p.global.cfg', stack('__proto__', ''))]);
    expect(r.instances).toHaveLength(1);
    expect(Object.keys(r.native)).toEqual(['__proto__']);
  });
  test('an id too long for secret_ref imports without a connection', () => {
    const id = 'x'.repeat(2100);
    const r = readCuraMachineInstances([file('machine_instances/l.global.cfg', stack(id, octo))]);
    expect(r.instances[0]!.entity.connection).toBeUndefined();
    expect(r.instances[0]!.credential).toBeUndefined();
    expect(r.diagnostics.some((d) => d.message.includes('octoprint connection is invalid'))).toBe(true);
  });
  test('bounds: diagnostics are capped', () => {
    const files = Array.from({ length: 1200 }, (_, i) => file(`machine_instances/b${i}.global.cfg`, 'junk'));
    const r = readCuraMachineInstances(files, { maxFiles: 2000 });
    expect(r.diagnostics.length).toBe(1001);
    expect(r.diagnostics.at(-1)!.message).toBe('further diagnostics suppressed');
  });
});
