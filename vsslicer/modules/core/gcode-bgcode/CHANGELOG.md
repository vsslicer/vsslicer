# Changelog

## 0.4.0

- Fix: a JSON (encoding 1) slicer metadata block no longer raises `unknown-encoding`.
- `bgcodeToGcode(decodeGcodeBlocks(readBgcode(...)))` rebuilds the `.gcode` twin text (generator line, printer metadata, thumbnails, G-code, print metadata, Slicer3 JSON and slicer config) and ends with a `metadata` event exposing every metadata block, the raw Slicer3 JSON and the thumbnails. Tested line for line against both twin fixtures. (GCP-14)

## 0.3.3

- Build in `prepack`, so a plain `pnpm publish` never ships a stale or missing `dist`. (PLT-180)

## 0.3.2

- Dev: `@vsslicer/tooling` ^0.8.1; lockfile pins current versions only. (PLT-179)

## 0.3.1

- Fix: a compressed block declaring more than 64 MiB, or (Heatshrink) more than 16 times its compressed size, yields `block-too-large` and is not decoded (a 4-byte block claiming 4 GB no longer allocates 4 GB).
- Fix: the deflate codec stops at the declared size (`maxOutputLength`) instead of inflating a bomb first.

## 0.3.0

- MeatPack decoder (encoding 1 and 2), pure TypeScript, with libbgcode's re-spacing of G lines: `meatpackDecode(bytes)`. Throws on a stream that ends inside a command or full-width character.
- `decodeGcodeBlocks(events)` wraps `readBgcode`: each decodable G-code block is followed by `{ kind: 'gcode', block, text }` (Heatshrink then MeatPack); a corrupt MeatPack block yields `decode-failed`.
- Fix: the Heatshrink file header now carries the complete ISC permission and disclaimer text.

## 0.2.0

- Heatshrink decoder (window 11 or 12, lookahead 4), pure TypeScript: `heatshrinkDecode(data, size, windowBits, lookaheadBits)` and the `heatshrink11Codec` / `heatshrink12Codec` codecs for compression values 2 and 3. Whole-block; output is bounded by the declared uncompressed size and corrupt streams throw (reported as `decode-failed`).

## 0.1.1

- Fix: a source ending with any partial block header or file header bytes now yields `truncated` (only an exact block boundary ends quietly).
- Reads buffer chunks in a list instead of re-concatenating, so a large block in small chunks is linear.
- Provenance copyright line reworded.

## 0.1.0

- `readBgcode(source, codecs)`: streams the file header and blocks (file, printer, thumbnail, print, slicer metadata and G-code), verifies CRC32, reports typed diagnostics (`bad-magic`, `unsupported-version`, `unknown-checksum-type`, `unknown-block-type`, `unknown-compression`, `unsupported-compression`, `unknown-encoding`, `decode-failed`, `size-mismatch`, `crc-mismatch`, `truncated`).
- `Codec` port with a `node:zlib` `deflateCodec`; Heatshrink (GCP-12) and MeatPack (GCP-13) plug in later.
