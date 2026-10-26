// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, it, vi } from 'vitest';
import { trackContextLoss } from '../src/gl/context-loss.ts';

const canvas = () => new EventTarget() as unknown as HTMLCanvasElement;
const fire = (c: HTMLCanvasElement, type: string) => {
  const e = new Event(type, { cancelable: true });
  c.dispatchEvent(e);
  return e;
};

describe('trackContextLoss', () => {
  it('cancels the loss, rebuilds in order on restore, then calls onRestored', () => {
    const c = canvas();
    const log: string[] = [];
    const res = trackContextLoss(c, { onLost: () => log.push('lost'), onRestored: () => log.push('restored') });
    res.add(() => void log.push('a'));
    res.add(() => void log.push('b'));
    log.length = 0;
    expect(fire(c, 'webglcontextlost').defaultPrevented).toBe(true);
    fire(c, 'webglcontextrestored');
    expect(log).toEqual(['lost', 'a', 'b', 'restored']);
  });

  it('forgets an entry once removed, and frees it once', () => {
    const c = canvas();
    const res = trackContextLoss(c);
    const free = vi.fn();
    const build = vi.fn(() => free);
    const remove = res.add(build);
    remove();
    remove();
    fire(c, 'webglcontextrestored');
    expect(build).toHaveBeenCalledTimes(1);
    expect(free).toHaveBeenCalledTimes(1);
  });

  it('dispose drops all entries and stops listening', () => {
    const c = canvas();
    const res = trackContextLoss(c);
    const build = vi.fn();
    res.add(build);
    res.dispose();
    expect(fire(c, 'webglcontextlost').defaultPrevented).toBe(false);
    fire(c, 'webglcontextrestored');
    expect(build).toHaveBeenCalledTimes(1);
  });

  it('frees the latest build, not the first, on remove and dispose', () => {
    const c = canvas();
    const res = trackContextLoss(c);
    const frees: ReturnType<typeof vi.fn>[] = [];
    const build = () => {
      const f = vi.fn();
      frees.push(f);
      return f;
    };
    const remove = res.add(build);
    res.add(build);
    fire(c, 'webglcontextrestored');
    expect(frees).toHaveLength(4);
    remove();
    expect(frees.map((f) => f.mock.calls.length)).toEqual([0, 0, 1, 0]);
    res.dispose();
    expect(frees.map((f) => f.mock.calls.length)).toEqual([0, 0, 1, 1]);
  });

  it('does not call the lost context free on remove or dispose after a failed restore', () => {
    const c = canvas();
    const res = trackContextLoss(c);
    const oldFree = vi.fn();
    let armed = false;
    const build = () => {
      if (armed) throw new Error('boom');
      return oldFree;
    };
    const remove = res.add(build);
    res.add(build);
    armed = true;
    fire(c, 'webglcontextrestored');
    remove();
    res.dispose();
    expect(oldFree).not.toHaveBeenCalled();
  });

  it('finishes the rebuild loop when one entry throws and reports the first error', () => {
    const c = canvas();
    const onRestored = vi.fn();
    const res = trackContextLoss(c, { onRestored });
    const boom = new Error('boom');
    let armed = false;
    res.add(() => {
      if (armed) throw boom;
    });
    const second = vi.fn();
    res.add(second);
    armed = true;
    fire(c, 'webglcontextrestored');
    expect(second).toHaveBeenCalledTimes(2);
    expect(onRestored).toHaveBeenCalledWith(boom);
    fire(c, 'webglcontextrestored');
    expect(onRestored).toHaveBeenCalledTimes(2);
  });
});
