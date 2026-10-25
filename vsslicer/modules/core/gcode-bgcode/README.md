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
- Heatshrink (compression 2, 3) needs its codec passed; without it the block has `data: undefined` plus an `unsupported-compression` warning. G-code `params.encoding` (MeatPack 1, 2) is not decoded here.
- Consumers map a diagnostic's byte `offset` to `Diagnostic.fileOffset` (offset in decoded text) of `@vsslicer/gcode-api`.
