// SPDX-License-Identifier: AGPL-3.0-or-later
import { MalformedMeshError } from '../domain/errors.ts';

/** A longer line is not a mesh file; without a cap, one endless line makes joining chunks quadratic. */
export const MAX_LINE_CHARS = 1 << 20;

/** Lines of a text file fed as chunks of any size; `\r\n` and `\n` both end a line. Yields the 1-based line number too. */
export async function* textLines(
  chunks: AsyncIterable<Uint8Array> | Iterable<Uint8Array>,
): AsyncGenerator<readonly [string, number]> {
  const decoder = new TextDecoder('utf-8'); // stream mode keeps a character split across chunks whole
  let rest = '';
  let n = 0;
  for await (const chunk of chunks) {
    const parts = (rest + decoder.decode(chunk, { stream: true })).split('\n');
    rest = parts.pop() as string;
    if (rest.length > MAX_LINE_CHARS)
      throw new MalformedMeshError(n + parts.length + 1, 'the line is too long for a model file');
    for (const l of parts) yield [l, (n += 1)];
  }
  rest += decoder.decode();
  if (rest !== '') yield [rest, n + 1];
}

const NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

/** Strict decimal number; anything else (empty, hex, `nan`, units) is a `MalformedMeshError` naming the line. */
export function parseNumber(token: string | undefined, line: number): number {
  if (token === undefined || !NUMBER.test(token))
    throw new MalformedMeshError(line, `"${token ?? ''}" is not a number`);
  return Number(token);
}

/** Float buffer that grows as values arrive, so file size, not a header, decides memory. */
export class FloatBuffer {
  private data = new Float32Array(9 * 1024);
  length = 0;
  push(a: number, b: number, c: number): void {
    if (this.length + 3 > this.data.length) {
      const bigger = new Float32Array(this.data.length * 2);
      bigger.set(this.data);
      this.data = bigger;
    }
    this.data[this.length++] = a;
    this.data[this.length++] = b;
    this.data[this.length++] = c;
  }
  view(): Float32Array {
    return this.data.subarray(0, this.length);
  }
}
