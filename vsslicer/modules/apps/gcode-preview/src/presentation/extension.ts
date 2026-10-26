// SPDX-License-Identifier: AGPL-3.0-or-later
// Presentation layer entry: the only file that imports the VS Code API at runtime.
import * as vscode from 'vscode';
import { workerLoader } from '../adapters/worker-loader.ts';
import { registerCommands, type GcodePreviewApi } from './commands.ts';
import { registerPreview, type PreviewProbe } from './provider.ts';

/** The public API (`GcodePreviewApi`) plus the probe the integration tests read. */
export const activate = (context: vscode.ExtensionContext): GcodePreviewApi & PreviewProbe => {
  const probe = registerPreview(
    context,
    vscode,
    workerLoader(vscode.Uri.joinPath(context.extensionUri, 'dist', 'worker.js').fsPath),
  );
  return { ...probe, ...registerCommands(context, vscode, probe) };
};
