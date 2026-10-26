# @vsslicer/gcode-bgcode

Reader for the PrusaSlicer binary G-code container (`.bgcode`), ported from libbgcode (AGPL-3.0).

```ts
import { readBgcode, deflateCodec, heatshrink11Codec, heatshrink12Codec } from '@vsslicer/gcode-bgcode';

for await (const e of readBgcode(stream, [deflateCodec, heatshrink11Codec, heatshrink12Codec])) {
  if (e.kind === 'block') use(e.block); // block.data is decompressed, or undefined if no codec could decode it
  if (e.kind === 'diagnostic') report(e.diagnostic); // offset is a byte offset in the file
}
```

- Layers: `domain` (header/block model, CRC32, diagnostics), `application` (`readBgcode`, `Codec` port), `adapters` (Deflate, Heatshrink 11-4 and 12-4).
- Recoverable problems (`crc-mismatch`, `unsupported-compression`, `decode-failed`, `size-mismatch`, `unknown-encoding`) still yield the block. An unknown block type or compression value, a bad header or truncation end the stream, since the next block boundary is unknown.
- Heatshrink (compression 2, 3) needs its codec passed; without it the block has `data: undefined` plus an `unsupported-compression` warning. `readBgcode` itself leaves G-code `params.encoding` (MeatPack 1, 2) alone.
- Consumers map a diagnostic's byte `offset` to `Diagnostic.fileOffset` (offset in decoded text) of `@vsslicer/gcode-api`.

Requires Node >= 24 (or an extension host with Node's `Buffer`): the latin1 helpers use it, and `latin1ToBytes` returns bytes whose `.buffer` is exactly the text.

## G-code text

```ts
import {
  decodeGcodeBlocks,
  readBgcode,
  deflateCodec,
  heatshrink11Codec,
  heatshrink12Codec,
} from '@vsslicer/gcode-bgcode';

const parts: Uint8Array[] = [];
for await (const e of decodeGcodeBlocks(readBgcode(stream, [deflateCodec, heatshrink11Codec, heatshrink12Codec]))) {
  if (e.kind === 'gcode') parts.push(e.text); // Heatshrink then MeatPack undone, block by block
  if (e.kind === 'diagnostic') report(e.diagnostic); // a corrupt MeatPack block is `decode-failed`
}
```

- `meatpackDecode(bytes)` does one block (encoding 1 and 2 decode alike; comments are plain bytes in 2), including libbgcode's re-spacing (`G1 X1 Y2`), so the text equals what PrusaSlicer's parser expects.
- The text of the G-code blocks is not the whole `.gcode`: header, thumbnail and config comments live in the other blocks. Tests check the decoded blocks appear byte for byte in the reference `.gcode` (see `test/meatpack.test.ts`).

## .gcode twin and metadata

```ts
for await (const e of bgcodeToGcode(decodeGcodeBlocks(readBgcode(stream, codecs)))) {
  if (e.kind === 'text') out.push(e.text); // concatenated: the text .gcode, line for line
  if (e.kind === 'metadata') use(e.metadata); // file, printer, print, slicer (INI), slicerJson (raw), thumbnails
}
```

Layout follows libbgcode's converter (blank lines dropped from G-code blocks). Slicer3 JSON is exposed raw; no fixture has one, so it is tested with a synthetic file.
