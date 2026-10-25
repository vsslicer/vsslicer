// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test, vi } from 'vitest';
import {
  createWebviewApi,
  createWindowChannel,
  watchTheme,
  watchVisibility,
  handshake,
  type ThemeHost,
  type WindowLike,
} from '../src/webview/index.ts';

test('state round trip is typed and acquire is called once', () => {
  let state: unknown;
  const acquire = vi.fn(() => ({
    postMessage: vi.fn(),
    getState: () => state as { n: number } | undefined,
    setState: (s: { n: number }) => ((state = s), s),
  }));
  const api = createWebviewApi<{ n: number }>(acquire);
  expect(api.getState()).toBeUndefined();
  api.setState({ n: 3 });
  expect(api.getState()?.n).toBe(3);
  expect(acquire).toHaveBeenCalledTimes(1);
});

function fakeWindow(parent: object): WindowLike & { emit(data: unknown, source: unknown): void; count(): number } {
  const ls = new Set<(e: { data: unknown; source: unknown }) => void>();
  return {
    parent,
    addEventListener: (_t, l) => void ls.add(l),
    removeEventListener: (_t, l) => void ls.delete(l),
    emit: (data, source) => ls.forEach((l) => l({ data, source })),
    count: () => ls.size,
  };
}

test('window channel accepts only the host frame and unsubscribes', () => {
  const host = {};
  const win = fakeWindow(host);
  const ch = createWindowChannel(() => {}, win);
  const got: unknown[] = [];
  const off = ch.onMessage((m) => got.push(m));
  win.emit('from-host', host);
  win.emit('from-other-frame', {});
  win.emit('from-self', null);
  expect(got).toEqual(['from-host']);
  off();
  expect(win.count()).toBe(0);
});

test('window channel completes a handshake only with the host answering', async () => {
  const host = {};
  const win = fakeWindow(host);
  const posted: { session?: string }[] = [];
  const ch = createWindowChannel((m) => posted.push(m as never), win);
  const p = handshake(ch, 's1', { timeoutMs: 1000 });
  const welcome = { tag: 'vsslicer/webview-kit', v: 1, kind: 'welcome', session: 's1' };
  win.emit(welcome, {}); // forged from another frame
  win.emit(welcome, host);
  await expect(p).resolves.toMatchObject({ session: 's1' });
});

test('theme tokens update on change, not when equal', () => {
  let tokens = { '--vscode-foreground': '#fff' };
  let fire = () => {};
  const host: ThemeHost = { tokens: () => ({ ...tokens }), observe: (cb) => ((fire = cb), () => (fire = () => {})) };
  const seen: unknown[] = [];
  const stop = watchTheme(host, (t) => seen.push(t));
  fire();
  tokens = { '--vscode-foreground': '#000' };
  fire();
  expect(seen).toEqual([{ '--vscode-foreground': '#fff' }, { '--vscode-foreground': '#000' }]);
  stop();
});

test('visibility reports hidden and restored', () => {
  let l = () => {};
  const doc = {
    visibilityState: 'hidden',
    addEventListener: (_: 'visibilitychange', f: () => void) => (l = f),
    removeEventListener: () => {},
  };
  const seen: boolean[] = [];
  watchVisibility(doc, (v) => seen.push(v));
  l();
  doc.visibilityState = 'visible';
  l();
  expect(seen).toEqual([false, true]);
});
