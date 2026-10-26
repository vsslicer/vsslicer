// SPDX-License-Identifier: AGPL-3.0-or-later
// GCP-53: the feeds' `expectedMoves` tables (the integration test's oracle) match resolvePosition on the fixture file.
import test from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadPreview } from '../src/application/load-preview.ts';
import { resolvePosition, type PrintPosition } from '../src/domain/print-position.ts';

const fixture = (p: string) => fileURLToPath(new URL(`fixtures/${p}`, import.meta.url));
type Message = {
  params?: [{ virtual_sdcard: { file_position: number } }];
  print?: { layer_num: number; mc_percent: number };
};

for (const name of ['moonraker-file-position.json', 'bambu-layer-percent.json'])
  test(`${name}: expectedMoves match resolvePosition`, async () => {
    const feed = JSON.parse(readFileSync(fixture(`feeds/${name}`), 'utf8')) as {
      file: string;
      messages: Message[];
      expectedMoves: number[];
    };
    const bytes = readFileSync(fixture(feed.file));
    const { parsed, timing } = await loadPreview(
      'gcode',
      (async function* () {
        yield bytes;
      })(),
    );
    const track = { ...parsed, totalTime: timing.totalTime };
    const moves = feed.messages.map((m) => {
      const p: PrintPosition = m.params
        ? { fileOffset: m.params[0].virtual_sdcard.file_position }
        : { layer: m.print!.layer_num, percent: m.print!.mc_percent };
      return resolvePosition(track, p).move;
    });
    assert.deepStrictEqual(feed.expectedMoves, moves);
    assert.ok(moves.at(-1)! > moves[0]!);
  });
