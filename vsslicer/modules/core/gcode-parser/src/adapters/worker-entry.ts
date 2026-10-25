// SPDX-License-Identifier: AGPL-3.0-or-later
import { parentPort, workerData } from 'node:worker_threads';
import { transferList } from '../domain/transfer.ts';
import { parse } from '../application/parse.ts';
import type { ParserOptions } from '../domain/parser.ts';
import { fileSource } from './file-source.ts';

export interface WorkerInit {
  path: string | undefined;
  options: ParserOptions;
  credits: number;
}

const port = parentPort;
if (!port) throw new Error('worker-entry must run in a worker thread');
const init = workerData as WorkerInit;
let credits = init.credits;
let wakeCredit: (() => void) | undefined;
let onInput: ((m: { type: 'data'; bytes: Uint8Array } | { type: 'end' }) => void) | undefined;

port.on('message', (m: { type: string }) => {
  if (m.type === 'credit') {
    credits++;
    wakeCredit?.();
  } else onInput?.(m as Parameters<NonNullable<typeof onInput>>[0]);
});

// the host answers each pull with one piece, so a slow parse never queues input
async function* hostSource(): AsyncGenerator<Uint8Array> {
  for (;;) {
    const reply = new Promise<Parameters<NonNullable<typeof onInput>>[0]>((r) => (onInput = r));
    port!.postMessage({ type: 'pull' });
    const m = await reply;
    if (m.type === 'end') return;
    yield m.bytes;
  }
}

try {
  for await (const chunk of parse(init.path === undefined ? hostSource() : fileSource(init.path), init.options)) {
    while (credits === 0) await new Promise<void>((r) => (wakeCredit = r));
    credits--;
    port.postMessage({ type: 'chunk', chunk }, transferList(chunk));
  }
  port.postMessage({ type: 'done' });
} catch (e) {
  const err = e instanceof Error ? e : new Error(String(e));
  port.postMessage({
    type: 'error',
    name: err.name,
    message: err.message,
    code: (err as { code?: unknown }).code,
    stack: err.stack,
  });
}
