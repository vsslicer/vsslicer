// SPDX-License-Identifier: AGPL-3.0-or-later
// Deterministic npm tarballs (PLT-215): the same files give the same bytes, and so the same lockfile integrity, on any machine.
// `pnpm pack` gzips through node:zlib, whose output depends on the zlib build (Homebrew's system zlib, Node's bundled
// Chromium fork, its CPU-specific paths), and its entry order follows the file-system walk. Here the tar is re-sorted,
// its headers normalised, and it is recompressed with fflate, which is pure JS.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { gzipSync } from 'fflate';

const BLOCK = 512;
const MTIME = Date.parse('1985-10-26T08:15:00Z') / 1000; // the date pnpm and npm use

const str = (h, at, len) => h.subarray(at, at + len).toString('utf8').replace(/\0.*$/s, '');
const oct = (h, at, len) => parseInt(str(h, at, len).trim() || '0', 8);
const putOct = (h, at, len, n) => h.write(`${n.toString(8).padStart(len - 1, '0')}\0`, at, len, 'ascii');
const putStr = (h, at, len, s) => (h.fill(0, at, at + len), h.write(s, at, len, 'utf8'));

/** Rewrites a ustar header in place: fixed mode, owner, time and device fields, then the checksum. Name, size, type and links stay. */
function normaliseHeader(h) {
  putOct(h, 100, 8, oct(h, 100, 8) & 0o111 ? 0o755 : 0o644);
  putOct(h, 108, 8, 0); // uid
  putOct(h, 116, 8, 0); // gid
  putOct(h, 136, 12, MTIME);
  putStr(h, 265, 32, ''); // uname
  putStr(h, 297, 32, ''); // gname
  putOct(h, 329, 8, 0); // devmajor
  putOct(h, 337, 8, 0); // devminor
  h.fill(0x20, 148, 156);
  let sum = 0;
  for (let i = 0; i < BLOCK; i++) sum += h[i];
  h.write(`${sum.toString(8).padStart(6, '0')}\0 `, 148, 8, 'ascii');
}

/**
 * A .tgz -> the same files as a canonical .tgz: entries sorted by path (byte order), headers normalised, gzip by fflate at
 * level 9 with no timestamp. A pax ('x', 'g') or GNU long-name ('L', 'K') header stays with the entry that follows it.
 * shortcut: sizes are read as octal (files under 8 GiB) and pax records are kept as written; upgrade if a module ships more.
 */
export function normaliseTgz(tgz) {
  const tar = gunzipSync(tgz);
  const entries = [];
  let pending = [];
  let longName;
  for (let at = 0; at + BLOCK <= tar.length; ) {
    const h = Buffer.from(tar.subarray(at, at + BLOCK));
    if (h.every((b) => b === 0)) break;
    const size = oct(h, 124, 12);
    const type = String.fromCharCode(h[156]);
    const data = tar.subarray(at + BLOCK, at + BLOCK + Math.ceil(size / BLOCK) * BLOCK);
    at += BLOCK + data.length;
    normaliseHeader(h);
    pending.push(h, data);
    if ('xgLK'.includes(type)) {
      if (type === 'x') longName = /\d+ path=([^\n]*)\n/.exec(data.subarray(0, size).toString('utf8'))?.[1] ?? longName;
      if (type === 'L') longName = data.subarray(0, size).toString('utf8').replace(/\0.*$/s, '');
      continue;
    }
    const prefix = str(h, 345, 155);
    const name = longName ?? (prefix ? `${prefix}/${str(h, 0, 100)}` : str(h, 0, 100));
    entries.push({ name, bytes: Buffer.concat(pending) });
    pending = [];
    longName = undefined;
  }
  entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  const out = Buffer.concat([...entries.map((e) => e.bytes), Buffer.alloc(2 * BLOCK)]);
  return Buffer.from(gzipSync(out, { level: 9, mtime: 0 }));
}

/** `pnpm pack` (files, prepack, publishConfig and manifest rewriting as pnpm does them), then normaliseTgz. Returns the tarball's path. */
export function packDeterministic(dir, env = process.env) {
  const out = mkdtempSync(join(tmpdir(), 'vsslicer-pack-'));
  const r = spawnSync('pnpm', ['pack', '--pack-destination', out], { cwd: dir, stdio: ['ignore', 'ignore', 'inherit'], env, shell: process.platform === 'win32' });
  if (r.status !== 0) throw new Error(`${dir}: pnpm pack failed`);
  const tgz = readdirSync(out).find((f) => f.endsWith('.tgz'));
  if (!tgz) throw new Error(`${dir}: pnpm pack wrote no tarball`);
  const file = join(out, tgz);
  writeFileSync(file, normaliseTgz(readFileSync(file)));
  return file;
}
