# Changelog

## 0.2.0

- Heatshrink decoder (window 11 or 12, lookahead 4), pure TypeScript: `heatshrinkDecode(data, size, windowBits, lookaheadBits)` and the `heatshrink11Codec` / `heatshrink12Codec` codecs for compression values 2 and 3. Whole-block; output is bounded by the declared uncompressed size and corrupt streams throw (reported as `decode-failed`).

## 0.1.1

- Fix: a source ending with any partial block header or file header bytes now yields `truncated` (only an exact block boundary ends quietly).
- Reads buffer chunks in a list instead of re-concatenating, so a large block in small chunks is linear.
- Provenance copyright line reworded.

## 0.1.0

- `readBgcode(source, codecs)`: streams the file header and blocks (file, printer, thumbnail, print, slicer metadata and G-code), verifies CRC32, reports typed diagnostics (`bad-magic`, `unsupported-version`, `unknown-checksum-type`, `unknown-block-type`, `unknown-compression`, `unsupported-compression`, `unknown-encoding`, `decode-failed`, `size-mismatch`, `crc-mismatch`, `truncated`).
- `Codec` port with a `node:zlib` `deflateCodec`; Heatshrink (GCP-12) and MeatPack (GCP-13) plug in later.
