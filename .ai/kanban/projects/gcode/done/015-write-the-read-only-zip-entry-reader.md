---
id: 15
title: Write the read-only zip entry reader
type: feature
priority: P0
effort: M
model: sonnet
area: [parser]
story: US5
milestone: "VSS:M1"
sprint: "VSS:SP6"
depends_on: [5, VWR-73]
created: 2026-10-25
---

Central directory and raw inflate for `.gcode.3mf`. Written new. Prefer the VWR container layer if it has shipped (the coordinator's reconciliation); fall back to fflate directly and note the later migration.

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Acceptance criteria

- [x] Reads central directory, stored and deflated entries, data descriptors and zip64 on test archives
- [x] A truncated or malformed zip gives a typed diagnostic (test)

## Tasks

- [x] Check whether the VWR container layer exists
- [x] Implement or wrap
- [x] Tests with descriptors and zip64

## Progress

Done, in review. Wrapped `@vsslicer/3mf` ^0.1.0 (VWR container layer shipped) in `vsslicer/modules/gcode-parser`, next to `bgcodeSource`: `gcode3mfSource(archive, entryName, {maxEntryBytes})` yields an entry's text as the byte stream `parse` takes; `gcode3mfEntries(archive)` lists `.gcode` entries (for GCP-16 plate enumeration). Index also re-exports `CorruptZipError` and `SizeCapExceededError`.

Verified: `pnpm lint && pnpm build && pnpm test` pass (new `test/gcode-3mf.test.ts`, 10 tests, zips built in the test: stored, deflated, data descriptor, zip64, truncated, garbage/empty, missing entry, damaged deflate, size cap; one case parses end to end).

Missing in 3mf 0.1.0 (not edited, per rules): `openZip` takes a whole in-memory archive and `inflated()` returns the entry as one buffer, so there is no entry stream or file-backed reader; peak memory is archive + entry (cap 512 MiB per entry). Marked `shortcut:` in the source. A big plate_N.gcode therefore is not streamed from disk; upgrade needs a streaming entry reader in 3mf. Data descriptors and zip64 work because 3mf trusts the central directory. CRC-32 is not verified by 3mf (its own shortcut), so GCP-16's MD5 check is the integrity guard. Pulls fflate and saxes into the parser's dependency tree (browser-check card PLT-92 may care).

Files: `src/adapters/gcode-3mf-source.ts`, `src/index.ts`, `test/gcode-3mf.test.ts`, `package.json` and `pnpm-lock.yaml` (added `@vsslicer/3mf ^0.1.0`).

Changelog: Added `gcode3mfSource` and `gcode3mfEntries`: read a `.gcode.3mf` plate as a parse source; zip errors surface as `CorruptZipError` / `SizeCapExceededError` from `@vsslicer/3mf`.

Review passed (gcp15-reviewer): lint/build/test green (348 tests); criteria checked against test/gcode-3mf.test.ts (stored, deflated, data descriptor, zip64, truncated/garbage/empty/missing/damaged -> CorruptZipError, cap -> SizeCapExceededError). No real .gcode.3mf exists in .reference (scanned all .3mf), so ran a system `zip`-made archive through gcode3mfSource+parse: 2000 moves ok; truncated variants give CorruptZipError. Layer: adapters, no vscode import. Streaming gap (archive+entry in memory) acceptable for now, flagged with shortcut: comment; follow-up needed: streaming entry reader card in the 3mf board. Browser: only gcode-preview worker (node, cjs) imports gcode-parser, webview does not; parser index already imports node:fs so was never browser-bundleable; 3mf+fflate+saxes is about 54 KB minified, will land in preview worker.js (127 KB) when it upgrades. Preview still pins parser 0.11.0 so its build is unaffected now.
