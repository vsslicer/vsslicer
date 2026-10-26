// SPDX-License-Identifier: AGPL-3.0-or-later
import type * as vscode from 'vscode';
import { detectFlavour, flavourLabel, HEAD_BYTES } from '../domain/flavour.ts';

export type Api = Pick<typeof vscode, 'window' | 'workspace' | 'StatusBarAlignment' | 'Range'>;

/** Shows the flavour of the active gcode document in a status-bar item. */
export const registerFlavourStatus = (context: Pick<vscode.ExtensionContext, 'subscriptions'>, host: Api): void => {
  const item = host.window.createStatusBarItem(host.StatusBarAlignment.Right, 90);
  const update = (): void => {
    const doc = host.window.activeTextEditor?.document;
    if (doc?.languageId !== 'gcode') return item.hide();
    const head = doc.getText(new host.Range(doc.positionAt(0), doc.positionAt(HEAD_BYTES)));
    // the override is keyed by workspace-relative path (or absolute path when outside a folder)
    const overrides = host.workspace
      .getConfiguration('vsslicer.gcode', doc.uri)
      .get<Record<string, string>>('flavourOverrides', {});
    const override = overrides[host.workspace.asRelativePath(doc.uri, false)] ?? overrides[doc.uri.fsPath];
    item.text = `G-code: ${flavourLabel(detectFlavour(head), override)}`;
    item.tooltip = 'G-code flavour. Override per file with the vsslicer.gcode.flavourOverrides setting.';
    item.show();
  };
  context.subscriptions.push(
    item,
    host.window.onDidChangeActiveTextEditor(update),
    host.workspace.onDidChangeTextDocument((e) => e.document === host.window.activeTextEditor?.document && update()),
    host.workspace.onDidChangeConfiguration(
      (e) => e.affectsConfiguration('vsslicer.gcode.flavourOverrides') && update(),
    ),
  );
  update();
};
