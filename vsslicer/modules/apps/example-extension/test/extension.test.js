// SPDX-License-Identifier: AGPL-3.0-or-later
const test = require('node:test');
const assert = require('node:assert');
const { activate } = require('../src/extension.js');

test('registers the hello command and greets via @vsslicer/example', () => {
  const handlers = {};
  const messages = [];
  const vscode = {
    commands: { registerCommand: (id, fn) => ((handlers[id] = fn), { dispose() {} }) },
    window: { showInformationMessage: (m) => messages.push(m) },
  };
  const context = { subscriptions: [] };
  activate(context, vscode);
  handlers['vsslicer.example.hello']();
  assert.strictEqual(context.subscriptions.length, 1);
  assert.deepStrictEqual(messages, ['Hello, VSSlicer!']);
});
