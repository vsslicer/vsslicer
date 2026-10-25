// SPDX-License-Identifier: AGPL-3.0-or-later
// Presentation layer entry: the only file that imports the VS Code API at runtime.
import * as vscode from 'vscode';
import { registerCommands } from './commands.ts';

export const activate = (context: vscode.ExtensionContext): void => registerCommands(context, vscode);
