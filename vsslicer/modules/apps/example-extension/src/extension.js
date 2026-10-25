// SPDX-License-Identifier: AGPL-3.0-or-later
// Presentation layer: the only place the VS Code API appears.
const { greet } = require('@vsslicer/example');

// `vscode` is injectable so tests run in plain Node; the extension host passes only `context`.
exports.activate = (context, vscode = require('vscode')) => {
  context.subscriptions.push(
    vscode.commands.registerCommand('vsslicer.example.hello', () =>
      vscode.window.showInformationMessage(greet('VSSlicer')))
  );
};
