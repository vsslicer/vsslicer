// SPDX-License-Identifier: AGPL-3.0-or-later
// Webview side of the integration tests (bundled to fixture/webview.js): receives every buffer, hashes it, reports.
// Besides the kit's own envelopes it answers `{ cmd }` messages from the test and forwards what the page itself
// observes (CSP violations, console errors), because the extension host cannot see the webview's console.
import { createWindowChannel, handshake, receiveBuffers, webviewApi } from '../../src/webview/index.ts';

const api = webviewApi<unknown>();
const channel = createWindowChannel(api.post, window);
const hex = (b: ArrayBuffer) => Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, '0')).join('');

document.addEventListener('securitypolicyviolation', (e) =>
  api.post({ type: 'csp', directive: e.violatedDirective, blocked: e.blockedURI }),
);
for (const level of ['error', 'warn'] as const) {
  const original = console[level].bind(console);
  console[level] = (...args: unknown[]) => {
    api.post({ type: 'console', level, text: args.map(String).join(' ') });
    original(...args);
  };
}

window.addEventListener('message', (e: MessageEvent<{ cmd?: string; value?: unknown }>) => {
  if (e.origin !== location.origin || typeof e.data?.cmd !== 'string') return;
  if (e.data.cmd === 'setState') {
    api.setState(e.data.value);
    api.post({ type: 'stateSet' });
  } else if (e.data.cmd === 'probeCsp') {
    // connect-src allows only the webview's own resources: this must be blocked and reported.
    fetch('https://csp-probe.invalid/').catch(() => {});
  }
});

receiveBuffers(
  channel,
  {
    async onBuffer(stream, data) {
      const hash = hex(await crypto.subtle.digest('SHA-256', data));
      const heap = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize;
      api.post({ type: 'result', stream, bytes: data.byteLength, hash, heap });
    },
    onError: (stream, error) => api.post({ type: 'error', stream, message: error.message }),
  },
  { timeoutMs: 60_000 },
);
void handshake(channel).then(
  () => api.post({ type: 'ready', state: api.getState() }),
  (e: Error) => api.post({ type: 'error', message: e.message }),
);
