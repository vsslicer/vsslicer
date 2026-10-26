// SPDX-License-Identifier: AGPL-3.0-or-later
// Presentation layer entry: the only file that imports the VS Code API at runtime.
import * as vscode from 'vscode';
import { ABOUT_COMMAND, ABOUT_MESSAGE } from '../domain/about.ts';

export const activate = (context: vscode.ExtensionContext): void => {
  context.subscriptions.push(
    vscode.commands.registerCommand(ABOUT_COMMAND, () => vscode.window.showInformationMessage(ABOUT_MESSAGE)),
  );
};
