// SPDX-License-Identifier: AGPL-3.0-or-later
import { FileTooLargeError } from '../../domain/errors.ts';

/**
 * Read a webview file (`fetch(asWebviewUri)`, D18) chunk by chunk into one owned buffer, refusing past `maxBytes`
 * (from `Content-Length` first, then as the chunks arrive, so a lying header cannot grow memory).
 */
export async function fetchBytes(url: string, maxBytes: number, signal?: AbortSignal): Promise<Uint8Array> {
  if (!Number.isFinite(maxBytes) || maxBytes <= 0) throw new RangeError(`maxBytes must be positive, got ${maxBytes}`);
  const res = await fetch(url, { signal });
  if (!res.ok || !res.body) throw new Error(`could not read ${url}: HTTP ${res.status}`);
  const declared = Number(res.headers.get('content-length'));
  if (declared > maxBytes) {
    void res.body.cancel();
    throw new FileTooLargeError(declared, maxBytes);
  }
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > maxBytes) {
      void reader.cancel();
      throw new FileTooLargeError(total, maxBytes);
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let at = 0;
  for (const c of chunks) {
    out.set(c, at);
    at += c.length;
  }
  return out;
}
