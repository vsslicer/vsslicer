// SPDX-License-Identifier: AGPL-3.0-or-later
// Presentation layer entry: the only file that imports the VS Code API at runtime.
import * as vscode from 'vscode';
import { workerLoader } from '../adapters/worker-loader.ts';
import { registerPreview, type PreviewProbe } from './provider.ts';

export const activate = (context: vscode.ExtensionContext): PreviewProbe =>
  registerPreview(context, vscode, workerLoader(vscode.Uri.joinPath(context.extensionUri, 'dist', 'worker.js').fsPath));
