// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, test } from 'vitest';
import { applyOverrides, type EntityBase } from '../src/index.ts';

const when = "nozzle.diameter == 0.6 and nozzle.flow == 'high_flow'";
const ctx = (diameter: number, flow: string) => ({ nozzle: { diameter, flow } });
const e = (overrides: EntityBase['overrides']): EntityBase => ({ id: 'p', settings: { a: 1, b: 1 }, overrides });

describe('applyOverrides', () => {
  test('the high-flow example applies only for that nozzle', () => {
    const p = e([{ when, settings: { a: 2 } }]);
    expect(applyOverrides(p, ctx(0.6, 'high_flow')).entity.settings).toEqual({ a: 2, b: 1 });
    expect(applyOverrides(p, ctx(0.6, 'standard')).entity.settings).toEqual({ a: 1, b: 1 });
    expect(applyOverrides(p, ctx(0.4, 'high_flow')).applied).toEqual([]);
  });
  test('all applies every true block in order', () => {
    const p = e([
      { when: 'nozzle.diameter == 0.4', match: 'all', settings: { a: 2, b: 2 } },
      { when: 'nozzle.diameter < 1', settings: { a: 3 } },
      { when: 'nozzle.diameter > 1', settings: { b: 9 } },
    ]);
    const r = applyOverrides(p, ctx(0.4, 'standard'));
    expect(r.entity.settings).toEqual({ a: 3, b: 2 });
    expect(r.applied).toEqual([0, 1]);
    expect(r.entity.overrides).toBeUndefined();
  });
  test('first stops at the first true block', () => {
    const p = e([
      { when: 'nozzle.diameter > 1', match: 'first', settings: { a: 7 } },
      { when: 'nozzle.diameter < 1', match: 'first', settings: { a: 2 } },
      { when: 'nozzle.diameter < 1', settings: { b: 2 } },
    ]);
    const r = applyOverrides(p, ctx(0.4, 'standard'));
    expect(r.applied).toEqual([1]);
    expect(r.entity.settings).toEqual({ a: 2, b: 1 });
  });
  test('an unparsable when applies the block and reports a diagnostic', () => {
    const r = applyOverrides(e([{ when: 'nozzle.diameter ==', settings: { a: 5 } }]), ctx(0.4, 'standard'));
    expect(r.entity.settings).toEqual({ a: 5, b: 1 });
    expect(r.applied).toEqual([0]);
    expect(r.diagnostics).toHaveLength(1);
    expect(r.diagnostics[0]).toMatch(/^overrides\[0\]: /);
  });
  test('does not mutate its input', () => {
    const p = e([{ when: 'nozzle.diameter < 1', settings: { a: 2 } }]);
    applyOverrides(p, ctx(0.4, 'x'));
    expect(p.settings).toEqual({ a: 1, b: 1 });
    expect(p.overrides).toHaveLength(1);
  });
});
