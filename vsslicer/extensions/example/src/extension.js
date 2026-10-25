// SPDX-License-Identifier: AGPL-3.0-or-later
// Presentation layer: the only place the VS Code API appears.
const vscode = require('vscode');
const { greet } = require('@vsslicer/example');

exports.activate = (context) => {
  context.subscriptions.push(
    vscode.commands.registerCommand('vsslicer.example.hello', () =>
      vscode.window.showInformationMessage(greet('VSSlicer')))
  );
};
