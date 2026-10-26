// SPDX-License-Identifier: AGPL-3.0-or-later
export { attachFakeHost, webviewStubScript, type StubPage } from '../adapters/webview-stub.ts';
export type { Channel } from '../application/channel.ts';
export { serveHandshake } from '../application/handshake.ts';
export * from '../domain/protocol.ts';
export { spyGlUploads, UPLOAD_CALLS, type GlSpy } from './gl-spy.ts';
