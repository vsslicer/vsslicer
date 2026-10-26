// SPDX-License-Identifier: AGPL-3.0-or-later
// Runs inside VS Code (pnpm test:integration). A stub extension follows the recorded feeds through `exports` and,
// separately, through the commands; both open the preview and move its marker with the feed.
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vscode from 'vscode';
import type { PreviewProbe } from '../../src/presentation/provider.ts';
import { positionOf, stubExtension, type Route } from './stub-extension.ts';

const fixtures = path.resolve(__dirname, '../test/fixtures'); // bundled to dist-test/, next to test/
const feed = (name: string) =>
  JSON.parse(fs.readFileSync(path.join(fixtures, 'feeds', name), 'utf8')) as {
    file: string;
    messages: unknown[];
    expectedMoves: number[];
  };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const until = async <T>(get: () => T | undefined, what: string): Promise<T> => {
  for (let i = 0; i < 100; i++) {
    const v = get();
    if (v !== undefined) return v;
    await sleep(100);
  }
  throw new Error(`timed out waiting for ${what}`);
};

describe('a stub extension follows a printer feed', () => {
  let probe: PreviewProbe;
  before(async () => {
    const ext = vscode.extensions.all.find(
      (e) => (e.packageJSON as { name?: string }).name === '@vsslicer/gcode-preview',
    );
    probe = (await ext!.activate()) as PreviewProbe;
  });
  afterEach(() => vscode.commands.executeCommand('workbench.action.closeAllEditors'));

  for (const route of ['exports', 'commands'] as Route[])
    for (const name of ['moonraker-file-position.json', 'bambu-layer-percent.json'])
      it(`via ${route}: ${name} opens the plate and the marker follows`, async () => {
        const { file, messages, expectedMoves } = feed(name);
        const uri = vscode.Uri.file(path.join(fixtures, file));
        const key = uri.toString();
        const stub = await stubExtension(route);
        const reached: number[] = [];
        for (const [i, message] of messages.entries()) {
          const position = positionOf(message);
          stub.follow(uri, position);
          // from the fixture table, not from the session under test (checked by test/feeds.test.ts)
          const expected = expectedMoves[i]!;
          const p = await until(
            () => (probe.progress(key)?.move === expected ? probe.progress(key) : undefined),
            `the marker on move ${expected}`,
          );
          reached.push(p.move);
        }
        assert.ok(
          reached.every((m, i) => i === 0 || m >= reached[i - 1]!),
          `the marker only advances: ${reached}`,
        );
        assert.ok(reached.at(-1)! > reached[0]!, 'the marker moved from the first position to the last');
        stub.stop(uri);
      });
});
