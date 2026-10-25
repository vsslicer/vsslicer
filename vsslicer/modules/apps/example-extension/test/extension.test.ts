// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';
import assert from 'node:assert';
import { registerCommands, type Api } from '../src/presentation/commands.ts';

test('registers the hello command and greets via @vsslicer/example', () => {
  const handlers: Record<string, () => unknown> = {};
  const messages: string[] = [];
  const api = {
    commands: { registerCommand: (id: string, fn: () => unknown) => ((handlers[id] = fn), { dispose() {} }) },
    window: { showInformationMessage: (m: string) => messages.push(m) },
  } as unknown as Api;
  const context = { subscriptions: [] as { dispose(): unknown }[] };
  registerCommands(context, api);
  handlers['vsslicer.example.hello']?.();
  assert.strictEqual(context.subscriptions.length, 1);
  assert.deepStrictEqual(messages, ['Hello, VSSlicer!']);
});
