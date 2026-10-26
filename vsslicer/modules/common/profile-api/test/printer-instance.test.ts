// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, test } from 'vitest';
import { HOST_TYPES, resolveToolheads, validateConnection } from '../src/domain/entities/printer-instance/index.ts';
import type { Nozzle, PrinterInstance } from '../src/index.ts';

const conn = (over: Record<string, unknown> = {}) => ({
  host_type: 'moonraker',
  url: 'http://p.local',
  secret_ref: 'vsslicer/p',
  ...over,
});
const paths = (c: unknown) => validateConnection(c).map((i) => i.path);

describe('connection', () => {
  test.each(HOST_TYPES)('%s validates', (host_type) => {
    expect(validateConnection(conn({ host_type }))).toEqual([]);
  });

  test('unknown host_type fails at connection.host_type', () => {
    expect(paths(conn({ host_type: 'klipper' }))).toEqual(['connection.host_type']);
    expect(paths(conn({ host_type: 3 }))).toEqual(['connection.host_type']);
  });

  test.each(['password', 'apikey', 'access_code', 'token', 'Password'])('credential property %s fails', (k) => {
    expect(paths(conn({ [k]: 'x' }))).toEqual([`connection.${k}`]);
  });

  test('hostile: 2,049-character host_type and url are refused, 2,048 allowed', () => {
    expect(paths(conn({ url: 'h'.repeat(2049) }))).toEqual(['connection.url']);
    expect(paths(conn({ host_type: 'x'.repeat(2049) }))).toEqual(['connection.host_type']);
    expect(paths(conn({ url: 'h'.repeat(2048) }))).toEqual([]);
  });

  test('hostile: pathological strings validate in linear time', () => {
    const t = Date.now();
    paths(conn({ url: 'a'.repeat(2048) + '!', host_type: '(a+)+$'.repeat(300) }));
    paths(conn({ url: 'http://' + '@:/.'.repeat(500) }));
    expect(Date.now() - t).toBeLessThan(200);
  });

  test('non-object connection', () => {
    expect(paths(null)).toEqual(['connection']);
    expect(paths([])).toEqual(['connection']);
  });
});

describe('toolhead slots', () => {
  // Bambu H2C: left and right nozzles, tests/fixtures/multitool/bambu-h2c.json
  const std: Nozzle = { id: 'bbl.nozzle.0.4.standard', diameter: 0.4, flow: 'standard' };
  const hf: Nozzle = { id: 'bbl.nozzle.0.4.high_flow', diameter: 0.4, flow: 'high_flow' };
  const nozzles = new Map([std, hf].map((n) => [n.id, n]));
  const h2c: PrinterInstance = {
    id: 'user.h2c',
    model: 'bbl.h2c',
    toolheads: [
      { slot: 1, nozzle: hf.id },
      { slot: 0, nozzle: std.id },
    ],
  };

  test('slot 0 and slot 1 each resolve to their nozzle entity', () => {
    expect(resolveToolheads(h2c, nozzles)).toEqual([
      { slot: 0, nozzle: std },
      { slot: 1, nozzle: hf },
    ]);
  });

  test('unknown nozzle and duplicate slot throw', () => {
    expect(() => resolveToolheads({ ...h2c, toolheads: [{ slot: 0, nozzle: 'nope' }] }, nozzles)).toThrow(
      /unknown nozzle/,
    );
    expect(() =>
      resolveToolheads(
        {
          ...h2c,
          toolheads: [
            { slot: 0, nozzle: std.id },
            { slot: 0, nozzle: hf.id },
          ],
        },
        nozzles,
      ),
    ).toThrow(/twice/);
  });
});
