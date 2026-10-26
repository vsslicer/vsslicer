---
id: 392
title: Refuse a 3MF whose declared inflated sizes exceed a total cap
type: bug
priority: P1
effort: S
model: sonnet
sprint: "VSS:SP7"
owner: sp7-3mf
docs: [.ai/audits/SP6-audit.md]
created: 2026-10-26
---

Module: 3mf (adapters). Finding 3 of the SP6 audit, `.ai/audits/SP6-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] Fixed as the audit describes
- [x] A test that fails before the fix
- [x] Bounds (rule 25): openZip takes maxTotalBytes (default 1 GiB) and refuses at open when the sum of declared uncompressed sizes exceeds it, before any inflation or allocation
- [x] Hostile test: a small zip declaring 4 x 400 MB entries is refused at open in under 100 ms

## Tasks

- [x] Fix as the audit describes

## Progress

Done. openZip takes maxTotalBytes (default DEFAULT_MAX_TOTAL_BYTES = 1 GiB) and throws SizeCapExceededError("the package") at open when the declared sizes sum above it, before any inflation or allocation. readPackage uses the default. Files: vsslicer/modules/3mf/src/adapters/zip/fflateZip.ts (removed the old shortcut note), test/zip.test.ts (hostile test: 4 x 300 MB declared in a tiny zip refused <100 ms; 3 x fits; custom cap; fails with the check disabled). The existing zip-bomb test (one 4 GiB entry) now passes maxTotalBytes since it is refused at open by design. Verified: pnpm lint clean, pnpm test 157 passed, pnpm build ok.\n\n### Coordinator: shared-file changes\n- src/index.ts line 27: export DEFAULT_MAX_TOTAL_BYTES next to DEFAULT_MAX_ENTRY_BYTES: `export { DEFAULT_MAX_ENTRY_BYTES, DEFAULT_MAX_TOTAL_BYTES, openZip } from "./adapters/zip/fflateZip.ts";`\n- CHANGELOG.md: "Refuse a package whose declared inflated sizes exceed 1 GiB (maxTotalBytes); cap component fan-out at 100,000 parts / 10,000,000 triangles; real-file tests use committed fixtures."

Review (sp7-rev-3mf): PASS. The declared-size sum is checked after the central-directory walk and before byName/raw/inflated, so before any allocation. Probes: 4 x 400 MB refused at open in 0.4 ms; exactly 1 GiB opens, 1 GiB + 1 refused; ZIP64 2 x 2^52 and 3 x MAX_SAFE_INTEGER refused (the sum is a double, cannot wrap; values past 2^53 are already CorruptZipError in u64); an entry declaring 100 bytes that inflates to 50 MB is stopped by the streaming check (CorruptZipError, 190 ms), so the sum cannot be bypassed by understating sizes. The changed zip-bomb test raises maxTotalBytes to 8 GiB, so it still exercises the per-entry SizeCapExceededError in inflated(). AC says 4 x 400 MB; the test uses 4 x 300 MB so that 3 x fits, which is fine. Coordinator shared files: the index.ts export is right but the file uses single quotes (`'./adapters/zip/fflateZip.ts'`); CHANGELOG entries follow `- VWR-<n>: ...` per ticket, so split the proposed line into VWR-390, VWR-391 and VWR-392 lines. Progress above has literal `\n\n` text (cosmetic).
