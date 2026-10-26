---
id: 198
title: Delete the test-only readBounded from the Cura catalogue tool
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP11"
docs: [.ai/audits/SP9-audit.md]
created: 2026-10-26
---

Finding 11 of the SP9 audit (`.ai/audits/SP9-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Deleted readBounded, CURA_SOURCE, FDM_MATERIALS_SOURCE and the unused statSync/readFileSync import from tools/catalogue/cura.ts. In test/catalogue-cura.test.ts the readBounded size test is gone (the extractCura over-limit assert remains and still covers MAX_FILE_BYTES); the determinism test now calls outputs() (pinned-commit check, readSource symlink refusal) and compares with the committed cura.json; the other pinned-source tests read from REPOS. Gate now needs all six checkouts, as catalogue-groups does.
Probe: restoring a bypass is not meaningful (code deleted); the test fails if outputs() differs or the Cura checkout is not at the pinned commit. Not separately mutated.
Verified in profile-api: lint, build pass; test 23 files / 723 tests pass; run.mjs checks pass. CI gate platform: unchanged (skips without checkouts).
Release lines: none (tools and tests only; no CHANGELOG or export change).

**Review passed (sp11-rev-prf-198)**
- Ran in profile-api: `pnpm install` ok, `pnpm lint` (eslint, prettier, tsc) ok, `pnpm build` ok, `pnpm test` 23 files / 723 tests pass; `test/catalogue-cura.test.ts` 17 pass with the pinned checkouts present. `node scripts/run.mjs checks` exit 0.
- Audit finding 11 fix as named: `readBounded`, `CURA_SOURCE`, `FDM_MATERIALS_SOURCE` and the fs import are gone from `tools/catalogue/cura.ts`; grep over tools/test/src finds no remaining caller. The determinism test now goes through `outputs()` (readSource: symlink/escape refusal, 16 MiB cap, pinned-commit check), gated like `catalogue-groups.test.ts`.
- Probes (temporary, restored, diff stat unchanged after): (1) one byte appended to `src/domain/catalogue/data/cura.json` -> "is deterministic and matches the committed data" fails; (2) `CURA_COMMIT` set to `deadbee` -> same test fails with "Cura is at 5bea2f8..., not the pinned deadbee". The pinned-commit check is now exercised, which the old test lacked.
- Bounds: the size limit stays covered by `extractCura(' '.repeat(MAX_FILE_BYTES + 1))` throwing, and readSource keeps its own cap (MAX_SOURCE_BYTES) for file reads.
- Note, no action: the provenance-line tests in the same block still read lines with plain `readFileSync` from `REPOS/Cura`; they only check cited line text, and the block's determinism test already pins the commit.
