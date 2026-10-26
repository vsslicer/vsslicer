// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';
import assert from 'node:assert';
import { nextFollow, type FollowState } from '../src/domain/follow-state.ts';

test('a fed move is shown while following, kept while broken out, and shown again on rejoin', () => {
  let s: FollowState = { following: true };
  const step = (e: Parameters<typeof nextFollow>[1]) => {
    const r = nextFollow(s, e);
    s = r.state;
    return r.seek;
  };
  assert.strictEqual(step({ kind: 'feed', move: 5 }), 5);
  assert.strictEqual(step({ kind: 'breakOut' }), undefined);
  assert.strictEqual(step({ kind: 'feed', move: 9 }), undefined, 'not shown while broken out');
  assert.strictEqual(step({ kind: 'feed', move: 12 }), undefined);
  assert.strictEqual(step({ kind: 'rejoin' }), 12, 'rejoin jumps to the newest fed move');
  assert.strictEqual(step({ kind: 'feed', move: 20 }), 20);
});

test('rejoin with nothing fed yet shows nothing', () => {
  assert.strictEqual(nextFollow({ following: false }, { kind: 'rejoin' }).seek, undefined);
});
