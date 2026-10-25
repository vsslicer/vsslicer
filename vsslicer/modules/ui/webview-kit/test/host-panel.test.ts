// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test, vi } from 'vitest';
import { createPanelChannel, serveHandshake, hello, type HostPanel } from '../src/host/index.ts';

function fakePanel() {
  const rx = new Set<(m: unknown) => void>();
  const dis = new Set<() => void>();
  const sent: unknown[] = [];
  const panel: HostPanel & { dispose(): void; rx: typeof rx; fail: boolean; undeliverable: boolean } = {
    fail: false,
    undeliverable: false,
    rx,
    webview: {
      postMessage: (m) =>
        panel.fail ? Promise.reject(new Error('x')) : (sent.push(m), Promise.resolve(!panel.undeliverable)),
      onDidReceiveMessage: (l) => (rx.add(l), { dispose: () => rx.delete(l) }),
    },
    onDidDispose: (l) => (dis.add(l), { dispose: () => dis.delete(l) }),
    dispose: () => dis.forEach((d) => d()),
  };
  return { panel, sent };
}

test('disposal mid-transfer: one warning, no listener left', () => {
  const { panel, sent } = fakePanel();
  const warn = vi.fn();
  const ch = createPanelChannel(panel, { warn });
  ch.onMessage(() => {});
  ch.post('a');
  panel.dispose();
  ch.post('b');
  ch.post('c');
  expect(sent).toEqual(['a']);
  expect(warn).toHaveBeenCalledTimes(1);
  expect(panel.rx.size).toBe(0);
});

test('rejected postMessage is a warning, not an exception', async () => {
  const { panel } = fakePanel();
  panel.fail = true;
  const warn = vi.fn();
  const ch = createPanelChannel(panel, { warn });
  ch.post('a');
  ch.post('b');
  await new Promise((r) => setTimeout(r, 0));
  expect(warn).toHaveBeenCalledTimes(1);
});

test('a postMessage that resolves false counts as dropped, one warning total', async () => {
  const { panel } = fakePanel();
  panel.undeliverable = true;
  const warn = vi.fn();
  const ch = createPanelChannel(panel, { warn });
  ch.post('a');
  ch.post('b');
  await new Promise((r) => setTimeout(r, 0));
  expect(warn).toHaveBeenCalledTimes(1);
});

test('payloads pass through untouched and a reload (second hello) is answered again', () => {
  const { panel, sent } = fakePanel();
  const ch = createPanelChannel(panel);
  const got: unknown[] = [];
  const ready: string[] = [];
  serveHandshake(ch, { onReady: (s) => ready.push(s), onMismatch: () => {} });
  ch.onMessage((m) => got.push(m));
  const buf = new ArrayBuffer(4);
  panel.rx.forEach((l) => l({ payload: buf }));
  panel.rx.forEach((l) => l(hello('one')));
  panel.rx.forEach((l) => l(hello('two')));
  expect(got[0]).toEqual({ payload: buf });
  expect(ready).toEqual(['one', 'two']);
  expect(sent).toHaveLength(2);
});
