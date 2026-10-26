// SPDX-License-Identifier: AGPL-3.0-or-later
import { spawn } from 'node:child_process';
import { StringDecoder } from 'node:string_decoder';

export type Stream = 'stdout' | 'stderr';
export interface Line {
  stream: Stream;
  text: string;
}

export interface RunOptions {
  command: string;
  /** Passed as argv; never interpreted by a shell. NUL bytes are refused. */
  args?: readonly string[];
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  /**
   * Kill the process (SIGTERM, then SIGKILL after killGraceMs) when this many ms have passed.
   * A finite integer in 1..2^31-1; anything else is rejected.
   * The child runs in its own process group (POSIX), and the whole group is killed.
   * stdout and stderr are separate pipes: the relative order of their lines is not preserved.
   */
  timeoutMs: number;
  killGraceMs?: number;
  /** Longest line kept, in UTF-16 units; the rest of a longer line is dropped. Default 64 KiB. */
  maxLineLength?: number;
  /** Most lines kept in `result.lines`. Default 10_000. Later lines still reach onLine. */
  maxLines?: number;
  /** Most characters kept in `result.lines` in total. Default 4 MiB. */
  maxOutputChars?: number;
  /** Called synchronously for every line, in order per stream; nothing is buffered on its behalf. If it throws, the process tree is killed and runProcess rejects with that error. */
  onLine?: (line: Line) => void;
}

export interface RunResult {
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  timedOut: boolean;
  lines: Line[];
  /** `lines` stopped growing because maxLines or maxOutputChars was reached. */
  outputTruncated: boolean;
  /** Number of lines cut at maxLineLength. */
  longLines: number;
}

/** Splits text into lines holding at most one partial line of <= max chars: memory is O(max). */
export class LineSplitter {
  private decoder = new StringDecoder('utf8');
  private partial = '';
  private skipping = false;
  longLines = 0;
  private readonly max: number;
  private readonly emit: (text: string) => void;
  constructor(max: number, emit: (text: string) => void) {
    this.max = max;
    this.emit = emit;
  }

  write(chunk: Buffer): void {
    this.feed(this.decoder.write(chunk));
  }

  end(): void {
    this.feed(this.decoder.end());
    if (this.partial !== '' || this.skipping) this.flush();
  }

  private feed(s: string): void {
    let start = 0;
    for (;;) {
      const nl = s.indexOf('\n', start);
      const end = nl < 0 ? s.length : nl;
      if (!this.skipping) {
        const room = this.max - this.partial.length;
        if (end - start > room) {
          this.partial += s.slice(start, start + room);
          // never leave half a surrogate pair
          if (/[\ud800-\udbff]$/.test(this.partial)) this.partial = this.partial.slice(0, -1);
          this.skipping = true;
          this.longLines++;
        } else this.partial += s.slice(start, end);
      }
      if (nl < 0) return;
      this.flush();
      start = nl + 1;
    }
  }

  private flush(): void {
    const t = this.partial.endsWith('\r') ? this.partial.slice(0, -1) : this.partial;
    this.partial = '';
    this.skipping = false;
    this.emit(t);
  }
}

export function runProcess(opts: RunOptions): Promise<RunResult> {
  const args = opts.args ?? [];
  for (const a of [opts.command, ...args, ...(opts.cwd ? [opts.cwd] : [])]) {
    if (a.includes('\0')) return Promise.reject(new Error('NUL byte in command, argument or cwd'));
  }
  const maxLine = opts.maxLineLength ?? 64 * 1024;
  const maxLines = opts.maxLines ?? 10_000;
  const maxChars = opts.maxOutputChars ?? 4 * 1024 * 1024;
  const grace = opts.killGraceMs ?? 2000;
  for (const [name, v] of [
    ['timeoutMs', opts.timeoutMs],
    ['killGraceMs', grace],
  ] as const) {
    if (!Number.isInteger(v) || v < 1 || v > 2 ** 31 - 1) {
      return Promise.reject(new Error(`${name} must be an integer in 1..2147483647`));
    }
  }
  const posix = process.platform !== 'win32';

  return new Promise((resolve, reject) => {
    const child = spawn(opts.command, args, {
      shell: false,
      cwd: opts.cwd,
      env: opts.env,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: posix, // own process group, so the whole tree can be killed
      windowsHide: true,
    });
    const lines: Line[] = [];
    let chars = 0;
    let outputTruncated = false;
    let timedOut = false;
    const signalTree = (sig: NodeJS.Signals) => {
      try {
        if (posix && child.pid) process.kill(-child.pid, sig);
        else child.kill(sig);
      } catch {
        // already gone
      }
    };
    let failure: { error: unknown } | undefined;
    const onLine = (stream: Stream) => (text: string) => {
      if (failure) return;
      const line = { stream, text };
      if (!outputTruncated && lines.length < maxLines && chars + text.length <= maxChars) {
        lines.push(line);
        chars += text.length;
      } else outputTruncated = true;
      try {
        opts.onLine?.(line);
      } catch (error) {
        failure = { error };
        signalTree('SIGKILL');
      }
    };
    const out = new LineSplitter(maxLine, onLine('stdout'));
    const err = new LineSplitter(maxLine, onLine('stderr'));
    child.stdout.on('data', (c: Buffer) => out.write(c));
    child.stderr.on('data', (c: Buffer) => err.write(c));

    let killTimer: NodeJS.Timeout | undefined;
    const timer = setTimeout(() => {
      timedOut = true;
      signalTree('SIGTERM');
      killTimer = setTimeout(() => signalTree('SIGKILL'), grace);
    }, opts.timeoutMs);
    const clear = () => {
      clearTimeout(timer);
      clearTimeout(killTimer);
    };
    child.on('error', (e) => {
      clear();
      reject(e);
    });
    child.on('close', (exitCode, signal) => {
      clear();
      // Anything left in the group (grandchildren) goes too.
      if (posix && child.pid) signalTree('SIGKILL');
      out.end();
      err.end();
      if (failure) return reject(failure.error);
      resolve({ exitCode, signal, timedOut, lines, outputTruncated, longLines: out.longLines + err.longLines });
    });
  });
}
