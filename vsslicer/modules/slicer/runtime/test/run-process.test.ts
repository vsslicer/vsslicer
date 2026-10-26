// SPDX-License-Identifier: AGPL-3.0-or-later
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test, vi } from 'vitest';
import { LineSplitter, runProcess, type RunOptions } from '../src/adapters/run-process.ts';

const node = (script: string, extra: Partial<RunOptions> = {}, args: string[] = []) =>
  runProcess({ command: process.execPath, args: ['-e', script, ...args], timeoutMs: 60_000, ...extra });
const GUARD = 60_000;

describe('runProcess', () => {
  test('exit code and line streams', async () => {
    const r = await node(`console.log('a\\r');console.error('b');process.exit(3)`);
    expect(r.exitCode).toBe(3);
    expect(r.timedOut).toBe(false);
    expect(r.lines).toContainEqual({ stream: 'stdout', text: 'a' });
    expect(r.lines).toContainEqual({ stream: 'stderr', text: 'b' });
  });

  test.skipIf(process.platform === 'win32')('reports a killing signal', async () => {
    const r = await node(`process.kill(process.pid,'SIGABRT')`);
    expect(r.signal).toBe('SIGABRT');
    expect(r.exitCode).toBeNull();
  });

  test('no shell: spaces, quotes and ; reach the child unchanged', async () => {
    const arg = `a b "c" 'd'; echo $HOME \`x\` | y`;
    const r = await node(`console.log(JSON.stringify(process.argv.slice(1)))`, {}, [arg]);
    expect(JSON.parse(r.lines[0]!.text)).toEqual([arg]);
  });

  test('refuses NUL in arguments', async () => {
    await expect(runProcess({ command: process.execPath, args: ['a\0b'], timeoutMs: 1000 })).rejects.toThrow(/NUL/);
  });

  test('rejects when the binary does not exist', async () => {
    await expect(runProcess({ command: '/nonexistent/bin', timeoutMs: GUARD })).rejects.toThrow(/ENOENT/);
  });

  test('a hung child is killed on timeout', { timeout: GUARD }, async () => {
    const r = await node(`setInterval(()=>{},1000)`, { timeoutMs: 300 });
    expect(r.timedOut).toBe(true);
    expect(r.exitCode === null || r.exitCode !== 0).toBe(true);
  });

  test.skipIf(process.platform === 'win32')('SIGTERM-ignoring child gets SIGKILL', { timeout: GUARD }, async () => {
    const r = await node(`process.on('SIGTERM',()=>{});console.log('up');setInterval(()=>{},1000)`, {
      timeoutMs: 1000,
      killGraceMs: 200,
    });
    expect(r.timedOut).toBe(true);
    expect(r.signal).toBe('SIGKILL');
  });

  test.skipIf(process.platform === 'win32')('grandchildren in the group are killed', { timeout: GUARD }, async () => {
    const r = await node(
      `const c=require('child_process').spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{stdio:'inherit'});console.log(c.pid);setInterval(()=>{},1000)`,
      { timeoutMs: 1500, killGraceMs: 200 },
    );
    const pid = Number(r.lines[0]!.text);
    expect(() => process.kill(pid, 0)).toThrow(/ESRCH/);
  });

  test('large output does not deadlock; kept lines are bounded', { timeout: GUARD }, async () => {
    const r = await node(`const l='x'.repeat(99)+'\\n';for(let i=0;i<200000;i++)process.stdout.write(l)`, {
      maxLines: 100,
      maxOutputChars: 1e9,
    });
    expect(r.exitCode).toBe(0);
    expect(r.lines).toHaveLength(100);
    expect(r.outputTruncated).toBe(true);
  });

  test('onLine sees every line even past the kept bound', async () => {
    let n = 0;
    await node(`for(let i=0;i<1000;i++)console.log(i)`, { maxLines: 1, onLine: () => n++ });
    expect(n).toBe(1000);
  });

  test('a huge line without newline is cut at maxLineLength', { timeout: GUARD }, async () => {
    const r = await node(
      `const b='y'.repeat(1<<20);for(let i=0;i<32;i++)process.stdout.write(b);process.stdout.write('\\nnext\\n')`,
      { maxLineLength: 1000 },
    );
    expect(r.exitCode).toBe(0);
    expect(r.lines.map((l) => l.text.length)).toEqual([1000, 4]);
    expect(r.longLines).toBe(1);
  });
});

describe('runProcess hardening', () => {
  test.each([Infinity, NaN, 0, -1, 1.5, 2 ** 31])('rejects timeoutMs %s', async (t) => {
    await expect(runProcess({ command: process.execPath, timeoutMs: t })).rejects.toThrow(/timeoutMs/);
  });

  test.each([Infinity, NaN, 0, 2 ** 31])('rejects killGraceMs %s', async (g) => {
    await expect(runProcess({ command: process.execPath, timeoutMs: 1000, killGraceMs: g })).rejects.toThrow(
      /killGraceMs/,
    );
  });

  test('once output is truncated no later line is kept', async () => {
    const r = await node(`console.log('a');console.log('x'.repeat(50));console.log('b')`, { maxOutputChars: 10 });
    expect(r.lines.map((l) => l.text)).toEqual(['a']);
    expect(r.outputTruncated).toBe(true);
  });

  test.skipIf(process.platform === 'win32')(
    'an onLine exception kills the child and rejects',
    { timeout: GUARD },
    async () => {
      let pid = 0;
      await expect(
        node(`console.log(process.pid);setInterval(()=>{},1000)`, {
          onLine: (l) => {
            pid = Number(l.text);
            throw new Error('boom');
          },
        }),
      ).rejects.toThrow('boom');
      expect(() => process.kill(pid, 0)).toThrow(/ESRCH/);
    },
  );

  test.skipIf(process.platform === 'win32')('rejects with EACCES for a non-executable file', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'rp-'));
    try {
      const f = join(dir, 'noexec');
      writeFileSync(f, '#!/bin/sh\n');
      chmodSync(f, 0o644);
      await expect(runProcess({ command: f, timeoutMs: GUARD })).rejects.toThrow(/EACCES/);
    } finally {
      rmSync(dir, { recursive: true });
    }
  });

  test('an early exit leaves no pending timeout', async () => {
    const set = vi.spyOn(globalThis, 'setTimeout');
    const clear = vi.spyOn(globalThis, 'clearTimeout');
    try {
      const r = await node(`process.exit(0)`, { timeoutMs: 3_600_000 });
      expect(r.timedOut).toBe(false);
      const i = set.mock.calls.findIndex((c) => c[1] === 3_600_000);
      expect(i).toBeGreaterThanOrEqual(0);
      expect(clear).toHaveBeenCalledWith(set.mock.results[i]!.value);
    } finally {
      set.mockRestore();
      clear.mockRestore();
    }
  });
});

describe('LineSplitter', () => {
  test('a cut never leaves a lone high surrogate', () => {
    const out: string[] = [];
    const s = new LineSplitter(1, (t) => out.push(t));
    s.write(Buffer.from('😀\nab\n'));
    s.end();
    expect(out).toEqual(['', 'a']);
  });

  test('retained memory is bounded by max for any input size (op count ratio)', () => {
    const emitted: string[] = [];
    const s = new LineSplitter(10, (t) => emitted.push(t));
    for (let i = 0; i < 1000; i++) s.write(Buffer.from('z'.repeat(1000)));
    s.end();
    expect(emitted).toEqual(['z'.repeat(10)]);
  });

  test('splits across chunks and multibyte boundaries', () => {
    const out: string[] = [];
    const s = new LineSplitter(100, (t) => out.push(t));
    const b = Buffer.from('é\nab\n\nlast');
    s.write(b.subarray(0, 1));
    s.write(b.subarray(1));
    s.end();
    expect(out).toEqual(['é', 'ab', '', 'last']);
  });
});
