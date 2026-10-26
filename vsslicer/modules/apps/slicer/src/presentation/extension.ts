// SPDX-License-Identifier: AGPL-3.0-or-later
// Presentation layer entry: the only file that imports the VS Code API at runtime.
import * as vscode from 'vscode';
import { ABOUT_COMMAND, ABOUT_MESSAGE } from '../domain/about.ts';
import { createSettingsReader } from './config.ts';

export const activate = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand(ABOUT_COMMAND, () => vscode.window.showInformationMessage(ABOUT_MESSAGE)),
  );
  return {
    readSettings: createSettingsReader(
      (key) => vscode.workspace.getConfiguration('vsslicer.slicer').get(key),
      (problem) => void vscode.window.showWarningMessage(problem),
    ),
  };
};
