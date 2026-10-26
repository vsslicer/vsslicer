// SPDX-License-Identifier: AGPL-3.0-or-later
// Presentation layer entry: the only file that imports the VS Code API at runtime.
import type * as vscode from 'vscode';
import * as api from 'vscode';
import { registerFlavourStatus } from './status.ts';

export const activate = (context: vscode.ExtensionContext): void => registerFlavourStatus(context, api);
