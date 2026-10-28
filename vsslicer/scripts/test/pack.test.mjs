// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';
import assert from 'node:assert';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gunzipSync, gzipSync } from 'node:zlib';
import { gzipSync as fflateGzip } from 'fflate';
import { normaliseTgz, packDeterministic } from '../pack.mjs';

const mod = join(import.meta.dirname, '..', '..', 'modules', 'tooling', 'tooling');
const sha = (b) => createHash('sha512').update(b).digest('base64');

test('packing a module twice gives the same tarball hash', () => {
  const sha = () => {
    const out = mkdtempSync(join(tmpdir(), 'pack-'));
    execFileSync('pnpm', ['pack', '--pack-destination', out], { cwd: mod, stdio: 'pipe', shell: process.platform === 'win32' });
    return createHash('sha256').update(readFileSync(join(out, readdirSync(out)[0]))).digest('hex');
  };
  assert.strictEqual(sha(), sha());
});

// PLT-215: the lockfile integrity must not depend on the machine's zlib build, the file-system order or file metadata.
test('the deterministic tarball does not depend on the deflate implementation, entry order or header metadata', () => {
  const tar = gunzipSync(readFileSync(packDeterministic(mod)));
  // the entries (header + data blocks; tooling has no long names), reversed, with another mtime, uid and mode
  const entries = [];
  for (let at = 0; tar.readUInt8(at) !== 0; ) {
    const size = parseInt(tar.toString('ascii', at + 124, at + 135), 8);
    const len = 512 + Math.ceil(size / 512) * 512;
    const e = Buffer.from(tar.subarray(at, at + len));
    e.write('0001750\0', 108, 'ascii'); // uid 1000
    e.write('14000000000\0', 136, 'ascii'); // another mtime
    e.write(`${(parseInt(e.toString('ascii', 100, 107), 8) | 0o020).toString(8).padStart(6, '0')}\0`, 100, 'ascii'); // group-writable
    e.write('runner', 265, 'ascii'); // uname
    entries.push(e);
    at += len;
  }
  assert.ok(entries.length > 3);
  const shuffled = Buffer.concat([...entries.reverse(), Buffer.alloc(1024)]);
  const inputs = [gzipSync(tar, { level: 1 }), gzipSync(tar, { level: 9 }), fflateGzip(tar, { level: 6 }), gzipSync(shuffled), fflateGzip(shuffled, { level: 1 })];
  assert.strictEqual(new Set(inputs.map(sha)).size, inputs.length, 'the inputs really differ');
  const outputs = new Set(inputs.map((i) => sha(normaliseTgz(i))));
  assert.strictEqual(outputs.size, 1);
  // headers checksum-valid and readable by the system tar
  const listing = execFileSync('tar', ['tzf', '-'], { input: normaliseTgz(inputs[3]) }).toString().trim().split('\n');
  assert.deepStrictEqual(listing, [...listing].sort());
});
