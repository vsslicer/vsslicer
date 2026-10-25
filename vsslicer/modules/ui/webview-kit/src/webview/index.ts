// SPDX-License-Identifier: AGPL-3.0-or-later
export * from '../domain/protocol.ts';
export type { Channel } from '../application/channel.ts';
export { handshake } from '../application/handshake.ts';
export * from '../domain/chunk.ts';
export {
  sendBuffer,
  receiveBuffers,
  TRANSFER_DEFAULTS,
  type TransferOptions,
  type ReceiveHandlers,
} from '../application/transfer.ts';
export {
  createWebviewApi,
  webviewApi,
  createWindowChannel,
  domThemeHost,
  watchTheme,
  watchVisibility,
  type VsCodeApi,
  type WindowLike,
  type ThemeHost,
  type ThemeTokens,
} from '../adapters/webview-window.ts';
