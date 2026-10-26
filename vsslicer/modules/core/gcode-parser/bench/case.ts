// SPDX-License-Identifier: AGPL-3.0-or-later
// One benchmark case in its own process, so peak RSS is this parse's alone: `node bench/case.ts <file>`.
// Parses the file the way a consumer that keeps everything does (collect) and prints one JSON line.
import { collect, fileSource, parse } from '../src/index.ts';

const path = process.argv[2];
if (!path) throw new Error('usage: node bench/case.ts <file>');
const t0 = performance.now();
const file = await collect(parse(fileSource(path)));
const seconds = (performance.now() - t0) / 1000;
const bytes = (chunks: { byteLength: number }[]): number => chunks.reduce((n, c) => n + c.byteLength, 0);
console.log(
  JSON.stringify({
    moves: file.moveCount,
    moveBytes: bytes(file.moves),
    extrusionBytes: bytes(file.extrusion),
    seconds,
    maxRssMB: process.resourceUsage().maxRSS / 1024, // KiB on every platform in Node
  }),
);
