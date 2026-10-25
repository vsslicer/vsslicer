// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  type BgcodeDiagnostic,
  type Block,
  type BlockParams,
  type FileHeader,
  ChecksumType,
  Compression,
  FILE_HEADER_SIZE,
  MAGIC,
  VERSION,
  isBlockType,
  isCompression,
  paramsSize,
} from '../domain/bgcode.ts';
import { crc32 } from '../domain/crc32.ts';
import type { Codec } from './codec.ts';

export type BgcodeEvent =
  | { kind: 'header'; header: FileHeader }
  | { kind: 'block'; block: Block }
  | { kind: 'diagnostic'; diagnostic: BgcodeDiagnostic };

/** Pulls exactly `n` bytes at a time from a chunked source; `null` when the source ends first. */
function reader(source: AsyncIterable<Uint8Array>) {
  const it = source[Symbol.asyncIterator]();
  const chunks: Uint8Array[] = [];
  let buffered = 0;
  let consumed = 0;
  const take = async (n: number): Promise<Uint8Array | null> => {
    while (buffered < n) {
      const r = await it.next();
      if (r.done) return null;
      chunks.push(r.value);
      buffered += r.value.length;
    }
    // Join only the chunks that cover `n` bytes, once: linear in the bytes read.
    const out = new Uint8Array(n);
    let filled = 0;
    while (filled < n) {
      const c = chunks[0]!;
      const k = Math.min(c.length, n - filled);
      out.set(c.subarray(0, k), filled);
      filled += k;
      if (k === c.length) chunks.shift();
      else chunks[0] = c.subarray(k);
    }
    buffered -= n;
    consumed += n;
    return out;
  };
  return { take, offset: () => consumed, buffered: () => buffered };
}

/**
 * Reads a .bgcode stream as header, then blocks, with problems reported as `diagnostic` events.
 * CRC mismatches, unsupported compression and failed decodes keep the stream going (the block is
 * still yielded); an unknown block type or compression value, a bad header or truncation end it,
 * because the following block boundary cannot be known.
 * G-code encodings (MeatPack) are not decoded here: `block.params.encoding` tells the consumer.
 */
export async function* readBgcode(
  source: AsyncIterable<Uint8Array>,
  codecs: readonly Codec[] = [],
): AsyncGenerator<BgcodeEvent> {
  const { take, offset, buffered } = reader(source);
  const diag = (code: BgcodeDiagnostic['code'], at: number, message: string, severity: 'error' | 'warning' = 'error') =>
    ({ kind: 'diagnostic', diagnostic: { code, severity, offset: at, message } }) as const;

  const head = await take(FILE_HEADER_SIZE);
  if (!head) return yield diag('truncated', 0, 'file ends inside the file header');
  const hv = new DataView(head.buffer, head.byteOffset, head.length);
  if (!MAGIC.every((b, i) => head[i] === b))
    return yield diag('bad-magic', 0, 'not a .bgcode file (missing GCDE magic)');
  const version = hv.getUint32(4, true);
  if (version > VERSION)
    return yield diag('unsupported-version', 4, `container version ${version} is newer than ${VERSION}`);
  const checksumType = hv.getUint16(8, true);
  if (checksumType > ChecksumType.Crc32) return yield diag('unknown-checksum-type', 8, `checksum type ${checksumType}`);
  yield { kind: 'header', header: { version, checksumType: checksumType as ChecksumType } };
  const crcSize = checksumType === ChecksumType.Crc32 ? 4 : 0;

  for (;;) {
    const at = offset();
    const first = await take(8);
    if (!first) return buffered() === 0 ? undefined : yield diag('truncated', at, 'file ends inside a block header');
    const fv = new DataView(first.buffer, first.byteOffset, first.length);
    const type = fv.getUint16(0, true);
    const compression = fv.getUint16(2, true);
    if (!isBlockType(type)) return yield diag('unknown-block-type', at, `block type ${type}`);
    if (!isCompression(compression)) return yield diag('unknown-compression', at + 2, `compression ${compression}`);
    const uncompressedSize = fv.getUint32(4, true);
    let header = first;
    let compressedSize = uncompressedSize;
    if (compression !== Compression.None) {
      const extra = await take(4);
      if (!extra) return yield diag('truncated', at, 'file ends inside a block header');
      compressedSize = new DataView(extra.buffer, extra.byteOffset, 4).getUint32(0, true);
      header = Uint8Array.of(...first, ...extra);
    }
    const body = await take(paramsSize(type) + compressedSize + crcSize);
    if (!body)
      return yield diag('truncated', at, `file ends inside a block (type ${type}, ${compressedSize} payload bytes)`);

    const pv = new DataView(body.buffer, body.byteOffset, body.length);
    const params: BlockParams =
      type === 5
        ? { type, format: pv.getUint16(0, true), width: pv.getUint16(2, true), height: pv.getUint16(4, true) }
        : { type, encoding: pv.getUint16(0, true) };
    const payload = body.subarray(paramsSize(type), body.length - crcSize);

    if (crcSize) {
      const covered = body.subarray(0, body.length - crcSize);
      const expected = pv.getUint32(body.length - 4, true);
      if (crc32(covered, crc32(header)) !== expected)
        yield diag('crc-mismatch', at, `CRC32 mismatch in block type ${type}`);
    }
    const maxEncoding = type === 1 ? 2 : 0;
    if (type !== 5 && params.type !== 5 && params.encoding > maxEncoding)
      yield diag('unknown-encoding', at, `encoding ${params.encoding} in block type ${type}`);

    let data: Uint8Array | undefined = payload;
    if (compression !== Compression.None) {
      const codec = codecs.find((c) => c.compression === compression);
      data = undefined;
      if (!codec) yield diag('unsupported-compression', at + 2, `no codec for compression ${compression}`, 'warning');
      else
        try {
          data = codec.decode(payload, uncompressedSize);
          if (data.length !== uncompressedSize) {
            yield diag('size-mismatch', at, `decoded ${data.length} bytes, header says ${uncompressedSize}`);
            data = undefined;
          }
        } catch (e) {
          yield diag('decode-failed', at, `compression ${compression}: ${e instanceof Error ? e.message : String(e)}`);
        }
    }
    yield { kind: 'block', block: { type, compression, uncompressedSize, compressedSize, params, data, offset: at } };
  }
}
