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

(Superseded by the notes below.)

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

**Review failed (sp10-rev-gcp-42)**

Ran: `pnpm install --frozen-lockfile`, `pnpm lint` (eslint, prettier, tsc incl. bench) ok, `pnpm build` ok, `pnpm test` 102/102 pass, `node scripts/run.mjs checks` exit 0. `pnpm bench --sizes 50` on macOS: exit 0 (straight 148/86/481, arc 200/125/572 MB), 1 min 31 s; no `gcode-preview-bench-*` left in tmp.

Good: measures what the card names (process RSS of the host incl. the worker thread, worker `used_heap_size + external_memory`, summed RSS of the tagged Chromium process tree); 20 ms host sampling against a ~3.8 s 50 MB run gives ~190 samples, and 2 ms sampling gives the same peaks within run-to-run noise (133-146 MB host, 79-87 MB worker); webview RSS barely drops, so the final sample after `evaluate` gets the peak (peak 466, after 467). The gate compares MB only and exits 1: probes `arc-heavy-50MB.workerHeapPlusExternalMB = 50` -> exit 1 naming it; deleting the `straight-50MB` budget -> exit 1 "no budget"; budget.json restored byte-identical. Inputs go to `mkdtemp` and are removed in `finally`; `bench/` is outside package `files`; `pnpm test` is `node --test test/*.test.ts`, so bench is not in test or `run.mjs ci`. The CI step runs only when `gcode-preview` is in the selected modules, after `run.mjs ci` built `dist/worker.js`. The 1 GB criterion stays unticked as the coordinator ruled.

Problems:
1. `bench/budget.json:2-39` + `.github/workflows/ci.yml:100-105`: the Linux CI gate fails on a clean tree. The budget was calibrated on macOS (darwin, M1) and is enforced only on `ubuntu-latest`. Probe: the module copied into `mcr.microsoft.com/playwright:v1.64.1-noble` (Linux arm64, node 24.22, `-m 8g`), `pnpm install && pnpm build && pnpm bench --sizes 50` -> exit 1: `straight-50MB: hostRssMB 197 MB over budget 167 MB`, `arc-heavy-50MB: webviewTreeRssMB 770 MB over budget 719 MB` (Linux RSS is 15-35 % above macOS). The first gcode-preview PR would go red with no regression, so the "a budget regression fails CI" box is ticked without ever running on CI's platform. Fix (rule): a budget is valid only on the platform where it is enforced. Calibrate on Linux x64 (`--update` in an ubuntu container or from a CI run's output), or key budgets by `platform()` and have `run.ts` fail with "no budget for <os>" instead of comparing across OSes. Run the gate once on Linux before ticking it.
2. `.github/workflows/ci.yml:104`: CI runs the full `pnpm bench` (50, 200 and 500 MB, both profiles) on the Linux leg of `build` each time gcode-preview or anything it depends on changes (gcode-api, webview-kit, ...). The webview case alone took 32 s for 1.7 M moves here and grows with move count (500 MB arc-heavy is 28.8 M moves), so the full run is likely 20+ min on a 2-4 core runner (estimate from 50 MB timings, the 500 MB case was not run, as instructed). Fix (rule): a measuring run on the critical path of every PR that touches the preview gets a bounded size set. Gate on `--sizes 50,200` in PR CI and run the full 500 MB set on a schedule or `workflow_dispatch`, or give it its own job so it does not hold up the build matrix; record the CI wall time in the card.

Minor (not blocking): `run.ts:26` `--sizes` as the last argument throws `Cannot read properties of undefined` instead of the usage message; the "Not started." line under Progress is stale.

**Coordinator (SP10), fix decisions:** (1) key budgets by OS (`darwin`, `linux`); a missing entry for the running OS fails as "no budget for <os>". Calibrate `linux` in the `playwright:v1.64.1-noble` Docker image the reviewer used (arm64 here; note in Progress and in budget.json's comment that the x64 runner is unverified and may need one `--update`). (2) PR CI runs `pnpm bench --sizes 50,200`; the 500 MB set runs only on `workflow_dispatch` (manual), not on every PR. (3) `--sizes` without a value prints the usage message. (4) Replace the stale "Not started." line.

**sp10-gcp-42-fix (review fixes)**
- (1) `bench/budget.json` is now `{comment, platforms: {darwin, linux}}`; `run.ts` reads `platforms[platform()]` and throws "no budget for <os> (run with --update on <os>)" when missing; `--update` writes only the running OS's entry. `linux` calibrated with `--update` (full 6 cases) in `mcr.microsoft.com/playwright:v1.64.1-noble` (Linux arm64, `-m 8g`). The x64 CI runner is unverified and may need one `pnpm bench --update` there (also noted in budget.json's comment).
- Linux peaks (MB; host RSS / worker heap+ext / webview tree): straight 50: 196/97/555; 200: 369/254/958; 500: 716/567/1961. Arc-heavy 50: 242/122/770; 200: 552/395/1179; 500: 1173/955/2925. Sum at 500 MB straight: 2677 MB (still over the ~1 GB target; owner question stands).
- Gate run on Linux (Docker, budget as committed): `--sizes 50,200` exit 0, `--sizes 50 --no-webview` exit 0 (wall time is not asserted). On macOS `pnpm bench --sizes 50` exit 0 (straight 145/82/467, arc 180/127/633).
- (2) ci.yml: `workflow_dispatch` trigger added; the Linux bench step runs `pnpm bench --sizes 50,200` on PRs/pushes and the full `pnpm bench` (incl. 500 MB) only on `workflow_dispatch`. CI wall time not measured here (no runner); Docker arm64 50+200 MB both profiles took a few minutes.
- (3) `--sizes` / any flag without a value now throws the usage message.
- (4) the stale "Not started." line replaced.
- Mutation probes: Linux budget hostRssMB set to 100 -> exit 1 "straight-50MB: hostRssMB 187 MB over budget 100 MB"; budget key `linux` renamed -> "no budget for linux"; `--sizes` last arg -> usage message. Copy only (Docker scratch); the real budget.json was not mutated.
- Verified on macOS: lint ok (eslint, prettier, tsc).

**Review passed (sp10-coordinator, re-review of the fix round)**: the four coordinator decisions are in: `bench/budget.json` keyed `platforms.darwin` / `platforms.linux`; `.github/workflows/ci.yml` runs `pnpm bench --sizes 50,200` on PRs and the full set only on `workflow_dispatch`; `--sizes` without a value prints the usage message; stale Progress line replaced. macOS `pnpm bench --sizes 50` exits 0 (straight 141/85/481 MB, arc-heavy 181/118/572 MB host/worker/webview). The fix worker's Docker runs and probes (Linux budget 100 MB exits 1; missing `linux` key gives "no budget for linux") stand. Open: the x64 CI runner is unverified (noted in budget.json); the ~1 GB target is owner question Q25, reduction work GCP-121.
