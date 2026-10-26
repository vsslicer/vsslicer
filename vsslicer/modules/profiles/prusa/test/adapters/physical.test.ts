// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import {
  MAX_PHYSICAL_JSON_BYTES,
  readPhysicalPrinterIni,
  readPhysicalPrinterJson,
} from '../../src/adapters/physical/index.ts';

const KEY = 'FAKE-KEY-DO-NOT-USE-0000';
const nozzleOf = () => 'nozzle-0.4';
const iniFile = join(import.meta.dirname, '../fixtures/physical/Shop MK4.ini');

describe('2.9 INI', () => {
  test('instance plus separate credential; entity and diagnostics never hold it', () => {
    const src = readFileSync(iniFile);
    const before = Buffer.from(src);
    const r = readPhysicalPrinterIni(src, 'Shop MK4', { nozzleOf });
    expect(r.instance!.entity).toEqual({
      id: 'Shop MK4',
      model: 'Original Prusa MK4 0.4 nozzle',
      toolheads: [{ slot: 0, nozzle: 'nozzle-0.4' }],
      connection: { host_type: 'octoprint', url: '192.0.2.10', secret_ref: 'prusa-physical/Shop MK4' },
    });
    expect(r.instance!.credential).toBe(KEY);
    expect(JSON.stringify(r.instance!.entity)).not.toContain(KEY);
    expect(JSON.stringify(r.diagnostics)).not.toContain(KEY);
    expect(src.equals(before)).toBe(true);
  });

  test('unknown host type: diagnostic, no connection, no credential', () => {
    const r = readPhysicalPrinterIni(`host_type = repetier\nprint_host = h\nprinthost_apikey = ${KEY}\n`, 'x');
    expect(r.instance!.entity.connection).toBeUndefined();
    expect(r.instance!.credential).toBeUndefined();
    expect(r.diagnostics.some((d) => d.code === 'unknown-type')).toBe(true);
    expect(JSON.stringify(r.diagnostics)).not.toContain(KEY);
  });

  test('over-long host is refused', () => {
    const r = readPhysicalPrinterIni(`host_type = duet\nprint_host = ${'h'.repeat(2049)}\n`, 'x');
    expect(r.instance!.entity.connection).toBeUndefined();
  });
});

describe('3.0 JSON', () => {
  const doc = (o: object) =>
    JSON.stringify({
      physical_printer_user_given_name: 'Bench',
      physical_printer_host: '192.0.2.20',
      physical_printer_host_type: 'moonraker',
      physical_printer_authorization_type: 'key',
      physical_printer_api_key: KEY,
      physical_printer_password: '',
      hw_config: {},
      ...o,
    });

  test('instance plus separate credential', () => {
    const r = readPhysicalPrinterJson(doc({}), 'bench.json', { nozzleOf });
    expect(r.instance!.entity.connection).toEqual({
      host_type: 'moonraker',
      url: '192.0.2.20',
      secret_ref: 'prusa-physical/Bench',
    });
    expect(r.instance!.credential).toBe(KEY);
    expect(JSON.stringify(r.instance!.entity)).not.toContain(KEY);
    expect(JSON.stringify(r.diagnostics)).not.toContain(KEY);
  });

  test('digest auth uses the password; 3.0-only host types have no connection', () => {
    const r = readPhysicalPrinterJson(
      doc({ physical_printer_authorization_type: 'user', physical_printer_password: 'FAKE-PW' }),
      'f',
    );
    expect(r.instance!.credential).toBe('FAKE-PW');
    const s = readPhysicalPrinterJson(doc({ physical_printer_host_type: 'sl1' }), 'f');
    expect(s.instance!.entity.connection).toBeUndefined();
    expect(s.diagnostics.some((d) => d.code === 'unknown-type')).toBe(true);
  });

  test('hostile input: size, depth, garbage; no credential in diagnostics', () => {
    for (const bad of [`{"physical_printer_api_key": "${KEY}"`, '[]']) {
      const r = readPhysicalPrinterJson(bad, 'f');
      expect(r.instance).toBeUndefined();
      expect(r.diagnostics[0]?.code).toBe('invalid-json');
      expect(JSON.stringify(r.diagnostics)).not.toContain(KEY);
    }
  });

  test('valid objects over the size and depth caps are refused with the specific message', () => {
    const head = '{"hw_config":{},"x":"';
    const big = head + 'a'.repeat(MAX_PHYSICAL_JSON_BYTES + 1 - head.length - 2) + '"}';
    expect(Buffer.byteLength(big)).toBe(MAX_PHYSICAL_JSON_BYTES + 1);
    expect(JSON.parse(big)).toBeTypeOf('object');
    expect(readPhysicalPrinterJson(big, 'f').diagnostics[0]?.message).toContain('over 1048576 bytes');
    const deep = (n: number) => `{"hw_config":${'['.repeat(n)}${']'.repeat(n)}}`; // the object is level 1
    expect(readPhysicalPrinterJson(deep(16), 'f').diagnostics[0]?.message).toContain('nesting deeper than 16');
    expect(readPhysicalPrinterJson(deep(15), 'f').diagnostics[0]?.code).not.toBe('invalid-json');
  });

  test('authorization none gives no credential', () => {
    const r = readPhysicalPrinterJson(doc({ physical_printer_authorization_type: 'none' }), 'f');
    expect(r.instance!.credential).toBeUndefined();
  });
});

describe('2.9 INI presets and authorization', () => {
  test('quoted presets and escapes are unescaped like unescape_strings_cstyle', () => {
    const tail = '\nhost_type = duet\nprint_host = h\n';
    const a = readPhysicalPrinterIni('preset_names = "A B";"Original MK4S"' + tail, 'x');
    expect(a.instance!.entity.model).toBe('A B');
    const q = readPhysicalPrinterIni('preset_names = "C\\"D;E";F' + tail, 'x');
    expect(q.instance!.entity.model).toBe('C"D;E');
  });

  test.each(['A;"B', '"A" x', '"A', '"A\\'])('malformed preset_names %s: no instance, value not quoted', (bad) => {
    const r = readPhysicalPrinterIni(`preset_names = ${bad}\nprinthost_apikey = ${KEY}\n`, 'x');
    expect(r.instance).toBeUndefined();
    expect(r.diagnostics.some((d) => d.severity === 'error' && d.code === 'malformed-line')).toBe(true);
    expect(JSON.stringify(r.diagnostics)).not.toContain(KEY);
    expect(JSON.stringify(r.diagnostics)).not.toContain(bad);
  });

  test('user authorization gives the password, not a stale API key', () => {
    const ini = 'host_type = octoprint\nprint_host = h\nprinthost_apikey = STALE\nprinthost_password = FAKE-PW\n';
    expect(readPhysicalPrinterIni(ini + 'printhost_authorization_type = user\n', 'x').instance!.credential).toBe(
      'FAKE-PW',
    );
    expect(readPhysicalPrinterIni(ini + 'printhost_authorization_type = key\n', 'x').instance!.credential).toBe(
      'STALE',
    );
  });
});
