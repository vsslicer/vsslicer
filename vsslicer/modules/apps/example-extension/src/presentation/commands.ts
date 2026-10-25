// SPDX-License-Identifier: AGPL-3.0-or-later
// Presentation layer. Type-only import of the VS Code API, so tests run in plain Node.
import { randomBytes } from 'node:crypto';
import type * as vscode from 'vscode';
import { greet } from '@vsslicer/example';
import { webviewHtml } from './webviewHtml.ts';

export type Api = Pick<typeof vscode, 'commands' | 'window' | 'Uri'>;
type Context = Pick<vscode.ExtensionContext, 'subscriptions' | 'extensionUri'>;

export const registerCommands = (context: Context, api: Api): void => {
  context.subscriptions.push(
    api.commands.registerCommand('vsslicer.example.hello', () => api.window.showInformationMessage(greet('VSSlicer'))),
    api.commands.registerCommand('vsslicer.example.webview', () => {
      const panel = api.window.createWebviewPanel('vsslicer.example', 'VSSlicer Sample', 1, {
        enableScripts: true,
        localResourceRoots: [api.Uri.joinPath(context.extensionUri, 'dist')],
      });
      const script = panel.webview.asWebviewUri(api.Uri.joinPath(context.extensionUri, 'dist', 'webview.js'));
      panel.webview.html = webviewHtml(panel.webview.cspSource, script.toString(), randomBytes(16).toString('base64'));
    }),
  );
};
