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
  const header = res.headers.get('content-length');
  const declared = header === null || header.trim() === '' ? NaN : Number(header);
  if (declared > maxBytes) {
    void res.body.cancel();
    throw new FileTooLargeError(declared, maxBytes);
  }
  const reader = res.body.getReader();
  // Content-Length counts wire bytes; a content-encoded body is decoded longer, so only an identity body trusts it.
  const encoding = (res.headers.get('content-encoding') ?? 'identity').trim().toLowerCase();
  if (Number.isInteger(declared) && declared >= 0 && (encoding === 'identity' || encoding === '')) {
    // Known length within the cap: allocate once and write chunks in, so the download never costs twice its size.
    const out = new Uint8Array(declared);
    let at = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (at + value.length > declared) {
        void reader.cancel();
        throw new Error(`the body is longer than its Content-Length (${declared} bytes)`);
      }
      out.set(value, at);
      at += value.length;
    }
    return at === declared ? out : out.slice(0, at); // a short body: an owned buffer of what arrived
  }
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
