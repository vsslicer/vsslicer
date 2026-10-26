---
id: 33
title: "Spike: WebGPU probe and workers under the kit CSP"
type: spike
priority: P1
effort: S
model: opus
area: [webview-kit]
story: US7
milestone: "VSS:M1"
sprint: "VSS:SP9"
owner: PLT-33-worker
depends_on: [15, 32]
created: 2026-10-25
---

A probe of about 20 lines: `navigator.gpu.requestAdapter()` inside a webview and `Worker` from `blob:` and from `asWebviewUri` under the kit's CSP. WebGL2 stays the baseline either way (D6).

## Acceptance criteria

- [ ] Results on Windows, macOS and Linux with VS Code version and GPU, in `.reference/notes/`
- [ ] Proposed decisions on the VSS board: WebGPU availability and worker support
- [x] CSP helper adjusted (`worker-src`) if the result requires it (it does not: `worker-src S blob:` is required and enough)

## Tasks

- [x] Write the probe
- [ ] Run on the three OSes (ask owner)
- [x] Write note and propose decisions

## Progress

Done (2026-10-25, PLT-33-worker):

- Probe: a minimal extension in a `mktemp -d` folder. It uses `createWebviewHtml` from `@vsslicer/webview-kit@0.4.2` unchanged, plus a control variant without `blob:` in `worker-src`, and `@vsslicer/test-vscode@0.2.3` runs it on VS Code min (1.100.0) and stable (1.143.1). Its full source and the steps to run it are in the notes, so the owner can repeat it.
- Ran on macOS 27.2 with an Apple M1 Pro: WebGPU adapter and device work, WebGL2 works.
- Ran on Linux arm64 in a Debian container under Xvfb with no GPU: `navigator.gpu` is present but `requestAdapter()` returns null. WebGL2 falls back to SwiftShader on 1.100 and has no context at all on 1.143.
- Workers behave the same on both: `blob:` workers (classic and module) work, and fetching the `asWebviewUri` file into a `blob:` works. `new Worker(asWebviewUri)` fails with a same-origin SecurityError, not a CSP error. `data:` is refused. The control run shows that `blob:` in `worker-src` is required.
- Notes: `.reference/notes/PLT-33-webgpu-workers-probe.md`. Report: `docs/research/vscode-platform.md` §7, and its Open questions line was updated.

Proposed decisions (for the coordinator to record on the VSS board, no decision file written):

1. **Worker support.** Keep the kit CSP `worker-src <cspSource> blob:` as it is. Every worker starts from a `blob:` URL: fetch the worker bundle (shipped under `localResourceRoots`) and wrap it in a Blob, or inline it at build time. Worker bundles are self-contained. `new Worker(asWebviewUri(...))` is not supported.
2. **WebGPU availability.** WebGPU stays an opt-in upgrade on top of the WebGL2 baseline (D6). Detect it with `await navigator.gpu?.requestAdapter()` and check for a non-null result, never with `'gpu' in navigator`. When neither WebGPU nor WebGL2 is available (GPU-less VMs and CI on Chrome 150), the viewer shows a "no GPU" state.
3. Follow-up for webview-kit (a later card, not done here): remove the "unverified" comment at `src/domain/html.ts` (the `worker-src` line) and update the README row for `worker-src` with these results. Optionally add a small webview-side `startWorker(url)` helper that does the fetch-to-blob step.

Not done:

- Windows and Linux with a real GPU are not measured: there is no machine for them here. The owner was asked on the board (Q15, ticket PLT-33). The steps are in the notes, under "Reproduce". Criterion 1 stays unticked until those results arrive.
- Criterion 2 (decisions on the VSS board) is only proposed above, as the brief says. The coordinator records them.

Files: created `.reference/notes/PLT-33-webgpu-workers-probe.md`; changed `docs/research/vscode-platform.md` (new §7 and one Open questions line) and this card. No module was touched.

Review passed (macOS/Linux-container part) (2026-10-26, PLT-33-reviewer):

- Every §7 table row matches the raw result JSON for both runs (adapter, `maxBufferSize`, WebGL2 renderer, COI/SAB, the five worker forms, violation lists, and the CSP string actually served). The kit CSP measured is `contentSecurityPolicy` at `vsslicer/modules/webview-kit/src/domain/html.ts:28-40` (0.4.2, worker-src line unchanged in the tree). "No CSP change" holds: `blob:` (html.ts:38) is needed, as the control shows, and enough. `connect-src` (html.ts:36) allows the fetch-to-blob path.
- Proposed decisions 1 and 2 follow from the measurements. Decision 3 (the html.ts:37 comment and README.md:41 row) is correctly left as a follow-up card.
- Numbering is consistent: §7 is PLT-33 and §8 is PLT-31, and the Open questions lines cite the right section and Q15/Q16. Q15 exists in `board.py inbox`.
- Fixed: the raw JSON lived only in the `/var/folders` mktemp dir. I copied it to `.reference/notes/PLT-33-results/{darwin,linux-container}/` and updated notes line 43.
- Non-blocking: (a) the notes' "Negative control" line says every blob: form fails with SecurityError. On 1.143.1 it is an `error` event with no message, and the violation still fires. The report's wording is correct. (b) `docs/research/3d-viewer.md:32,36,37` and open questions 2 and 6 (lines 137, 141) still say `(unverified)`. Point them at vscode-platform.md §7 in the follow-up card. (c) "from 1.100 on" extrapolates from two measured versions (1.100.0 and 1.143.1).
- Left: criterion 1 (Windows, Linux with a GPU) waits on Q15. Criterion 2 waits on the coordinator filing the decisions.
