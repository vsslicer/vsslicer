---
id: 42
title: "Record host, worker and webview memory at 50, 200 and 500 MB"
type: chore
priority: P0
effort: L
model: sonnet
area: [editor]
story: US14
milestone: "VSS:M1"
sprint: "VSS:SP10"
depends_on: [41, 38]
created: 2026-10-25
---

Budget gate for the whole pipeline, with SwiftShader or a GPU.

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Acceptance criteria

- [ ] Peak host, worker and webview memory recorded at the three sizes; total under about 1 GB at 500 MB (recorded; the total is NOT under 1 GB: 1634 MB straight, see Progress)
- [x] A budget regression fails CI

## Tasks

- [x] Measurement harness
- [x] Budget file
- [x] CI job

## Progress

Not started.

Done by sp10-gcp-42 (the "needs PLT CI" line above is stale).
- `bench/generate.ts` (copy of gcode-parser's seeded generator), `bench/host-case.ts` (Node process running the built dist/worker.js, samples process RSS, worker heap + external every 20 ms), `bench/webview-case.ts` + `bench/webview.page.ts` (Chromium on SwiftShader: chunks -> concatMoves -> createPreviewRenderer; RSS of the browser process tree), `bench/run.ts` (`pnpm bench [--update] [--sizes] [--no-webview]`, exits 1 over budget), `bench/budget.json` (measured x1.25, bytes only), package.json bench script, tsconfig include, eslint override for bench, CHANGELOG, `.github/workflows/ci.yml` step (Linux, only when gcode-preview is among the changed modules; installs chromium then `pnpm bench`).
- Peaks (MB; host RSS / worker heap+external / webview tree RSS): straight 50: 133/80/471; 200: 307/242/759; 500: 656/561/978. Arc-heavy 500: 1056/922/1928. Full table in .reference/notes/GCP-42-memory.md.
- The "total under about 1 GB at 500 MB" criterion is not met, so it stays unticked: sum of host and webview peaks at 500 MB straight is 1634 MB (webview on SwiftShader keeps the GPU copy in RAM and has ~255 MB idle browser; a real GPU would move it to VRAM). Needs an owner/coordinator call: raise the target, or cut memory (upload per chunk instead of concatMoves, drop extrusion column from the webview message).
- Webview measured here on SwiftShader (works on this machine); not measured: a real GPU, the host-to-webview postMessage copy, VS Code's own base memory. Follow-up if wanted: measure inside a real VS Code via the GCP-41 integration harness.
- The Linux CI step is unverified (budget calibrated on macOS; may need `pnpm bench --update` on Linux once).
- Mutation probe: budget lowered (hostRssMB 100, webviewTreeRssMB 300 for straight-50MB) -> `pnpm bench --sizes 50` exits 1 naming both; restored.
- Verified: `pnpm lint`, `pnpm build`, `pnpm test` (102 pass) ok; `node scripts/run.mjs checks` ok; `pnpm bench` full run (6 cases) done with --update, `--sizes 50` passes against the budget.
- Moved SP5 to SP6 at SP5 start: dependency-blocked in SP5 (rule 7): depends on GCP-41 (moved to SP6).

**Coordinator (SP10):** the ~1 GB target is an owner question (asked on the board); reviewers judge this card on recording the peaks and the byte-based CI gate. The reduction work is the follow-up card (SP11).
