// SPDX-License-Identifier: AGPL-3.0-or-later
// Presentation layer. Type-only import of the VS Code API, so tests run in plain Node.
import type * as vscode from 'vscode';
import { greet } from '@vsslicer/example';

export type Api = Pick<typeof vscode, 'commands' | 'window'>;

export const registerCommands = (context: Pick<vscode.ExtensionContext, 'subscriptions'>, api: Api): void => {
  context.subscriptions.push(
    api.commands.registerCommand('vsslicer.example.hello', () => api.window.showInformationMessage(greet('VSSlicer'))),
  );
};
