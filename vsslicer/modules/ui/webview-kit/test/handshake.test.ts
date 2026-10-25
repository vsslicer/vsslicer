// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test, vi } from 'vitest';
import { serveHandshake, handshake } from '../src/application/handshake.ts';
import { PROTOCOL_TAG, TRANSPORT_SCHEMA_VERSION, VersionMismatchError } from '../src/domain/protocol.ts';
import { pair } from './pair.ts';

test('handshake runs on first load and again after a reload, with a new session each time', async () => {
  const [host, webview] = pair();
  const onReady = vi.fn();
  serveHandshake(host, { onReady, onMismatch: vi.fn() });

  await expect(handshake(webview, 'load-1')).resolves.toMatchObject({ kind: 'welcome', session: 'load-1' });
  // A reload is a fresh webview document on the same panel: it handshakes again.
  await expect(handshake(webview)).resolves.toMatchObject({ kind: 'welcome' });

  expect(onReady).toHaveBeenCalledTimes(2);
  expect(onReady.mock.calls[0]).toEqual(['load-1']);
  expect(onReady.mock.calls[1]?.[0]).not.toBe('load-1');
});

test('webview ignores foreign messages and welcomes for another session', async () => {
  const [host, webview] = pair();
  const done = handshake(webview, 'mine');
  host.post('unrelated');
  host.post({ tag: PROTOCOL_TAG, v: TRANSPORT_SCHEMA_VERSION, kind: 'welcome', session: 'stale' });
  host.post({ tag: PROTOCOL_TAG, v: TRANSPORT_SCHEMA_VERSION, kind: 'welcome', session: 'mine' });
  await expect(done).resolves.toMatchObject({ session: 'mine' });
});

test('host answers a newer webview with a reload frame and reports the mismatch', async () => {
  const [host, webview, log] = pair();
  const onMismatch = vi.fn();
  const onReady = vi.fn();
  serveHandshake(host, { onReady, onMismatch });

  webview.post({ tag: PROTOCOL_TAG, v: TRANSPORT_SCHEMA_VERSION + 1, kind: 'hello', session: 's' });
  await new Promise((r) => setTimeout(r, 0));

  expect(onReady).not.toHaveBeenCalled();
  expect(onMismatch).toHaveBeenCalledWith(expect.any(VersionMismatchError));
  expect(onMismatch.mock.calls[0]?.[0]).toMatchObject({
    expected: TRANSPORT_SCHEMA_VERSION,
    received: TRANSPORT_SCHEMA_VERSION + 1,
  });
  expect(log.at(-1)).toEqual({
    tag: PROTOCOL_TAG,
    v: TRANSPORT_SCHEMA_VERSION,
    kind: 'reload',
    expected: TRANSPORT_SCHEMA_VERSION,
  });
});

test('webview rejects with VersionMismatchError when the host asks for a reload', async () => {
  const [host, webview] = pair();
  const done = handshake(webview, 's');
  host.post({ tag: PROTOCOL_TAG, v: 9, kind: 'reload', expected: 9 });
  await expect(done).rejects.toMatchObject({
    name: 'VersionMismatchError',
    expected: 9,
    received: TRANSPORT_SCHEMA_VERSION,
  });
});

test('webview facing an older host replies reload and rejects', async () => {
  const [host, webview, log] = pair();
  const done = handshake(webview, 's');
  host.post({ tag: PROTOCOL_TAG, v: 0, kind: 'welcome', session: 's' });
  await expect(done).rejects.toBeInstanceOf(VersionMismatchError);
  expect(log.at(-1)).toMatchObject({ kind: 'reload', expected: TRANSPORT_SCHEMA_VERSION });
});

test('host asked for a reload by the webview reports the mismatch', async () => {
  const [host, webview] = pair();
  const onMismatch = vi.fn();
  serveHandshake(host, { onReady: vi.fn(), onMismatch });
  webview.post({ tag: PROTOCOL_TAG, v: 0, kind: 'reload', expected: 0 });
  await new Promise((r) => setTimeout(r, 0));
  expect(onMismatch.mock.calls[0]?.[0]).toMatchObject({ expected: TRANSPORT_SCHEMA_VERSION, received: 0 });
});

test('both sides unsubscribe: the handshake after settling, the host on dispose', async () => {
  const [host, webview] = pair();
  const onReady = vi.fn();
  const stop = serveHandshake(host, { onReady, onMismatch: vi.fn() });
  await handshake(webview, 'a');
  stop();
  const late = handshake(webview, 'b');
  await new Promise((r) => setTimeout(r, 0));
  expect(onReady).toHaveBeenCalledTimes(1);
  void late;
});
