---
id: 31
title: "Spike: postMessage transferables versus fetch(asWebviewUri) for 50 to 500 MB"
type: spike
priority: P0
effort: S
model: opus
area: [webview-kit]
story: US7
milestone: "VSS:M1"
sprint: "VSS:SP6"
owner: PLT-31-worker
depends_on: [15, 30]
created: 2026-10-25
---

Decides whether the kit's transport carries bulk data in messages or streams file-backed data over `fetch(asWebviewUri)`. Needs the owner's Windows, macOS and Linux machines for the numbers: ask on the board.

## Acceptance criteria

- [ ] Both methods measured at 50, 200 and 500 MB on Windows, macOS and Linux with time, peak memory, OS, GPU and VS Code version; raw data in `.reference/notes/`
- [ ] Proposed decision on the VSS board stating the method and chunk size the kit uses
- [ ] Findings feed the transport tasks

## Tasks

- [x] Write the probe extension using the harness
- [ ] Run on the three OSes (ask owner)
- [x] Write note and propose decision

## Progress

**Done (macOS only).** A probe extension, built in a temp dir on `@vsslicer/test-vscode@0.2.3` and `@vsslicer/webview-kit@0.4.2`, measured 10 methods at 50, 200 and 500 MiB, 3 runs each, on macOS 27.2 / M1 Pro (ANGLE Metal) / VS Code 1.143.1 / Electron 43.7.7. Every checksum matched. The report is `docs/research/vscode-platform.md` §8, and the §2 `event.source` claim is corrected. Raw rows are in `.reference/notes/PLT-31-results-darwin*.jsonl`, the probe source and run steps in `.reference/notes/PLT-31-probe.md`, and the running notes in `.reference/notes/PLT-31-transport-spike.md`.

**Not done.** Windows and Linux are not measured. The owner was asked on the board (Q16: run the probe, or defer to the PLT-16 CI matrix). The first criterion stays open until then. The decision below is proposed, not recorded on the VSS board: the coordinator files it. The third criterion is open until the downstream cards below exist.

**Proposed decision (kit bulk transport).**
1. Data that lives in a file (G-code, bgcode, 3MF, slicer output) goes by `fetch(asWebviewUri(file))` and is read with `response.body.getReader()`. The parser in the webview or its worker consumes it chunk by chunk, and `Range` (206, verified) gives random access. The chunk size is VS Code's, 64 KiB. The extension host does no work. Renderer memory stays flat (about 64 MiB at 500 MiB) only when the consumer is slower than the pipe (about 440 MB/s here); a count-only reader peaked at 513 MiB, about the file size (open question). Either way it is below chunked messages' 1.1 to 1.4 GB.
2. Buffers the host makes in memory go by `sendBuffer` with `chunkSize` 4 MiB and `window` 4, so `TRANSFER_DEFAULTS` changes from 1 MiB. That gives 800 to 850 MB/s at 200 and 500 MiB, against 650 to 700 MB/s at 1 MiB. Peak RSS is about 2 to 3 times the payload (2.2 times at 200 MiB, 2.7 times at 500 MiB).
3. Never post one large message: at 500 MiB it is 4 times slower and the renderer peaks at 1 GiB.

**Found along the way. Each needs a card:**
- **Kit bug, P0.** `createWindowChannel` (webview-kit, adapters) checks `event.source === window.parent`. VS Code sets `window.parent = window` in the content frame (`pre/index.html:252-254`), so every host message is dropped and `sendBuffer` times out. The fix is `event.origin === location.origin`, plus a test with `parent === self`. PLT-38's Playwright stub should mimic this.
- **Harness trap.** A test extension without `main` gets the null extension's API, and its ArrayBuffers arrive as `{}`. Add a line to the test-vscode README.
- **Downstream: PLT-39.** Give the test extension a `main`. Wait for the `createWindowChannel` fix or use the origin check. Use 4 MiB chunks, and expect about 250 ms of transfer plus hashing (use `crypto.subtle.digest`; a JS byte loop costs about 11 ms per MiB).

Files: created `.reference/notes/PLT-31-transport-spike.md`, `PLT-31-probe.md`, `PLT-31-results-darwin.jsonl`, `PLT-31-results-darwin-count.jsonl`. Changed `docs/research/vscode-platform.md` (§2 line, new §8, one Open questions line) and this card. No module was touched.

**Review failed (PLT-31-reviewer, 2026-10-26).** The macOS measurements are sound: all 90 jsonl rows recomputed (medians, MB/s, RSS deltas match the §8 table exactly), every `vscode@4ef6bab7` citation and `webview-kit@0.4.2:transfer.ts:61-63` checked against source, no module touched by this card (webview-kit edits in the tree belong to PLT-188), Q16 is filed. One write-up defect blocks it, because the coordinator will file the decision as written:
- `docs/research/vscode-platform.md:170` says fetch is "the only method whose memory stays flat (about 64 MiB at 500 MiB)", and card Progress decision item 1 says "Memory stayed flat at about 64 MiB for 500 MiB". The 64 MiB is the slow (checksum) consumer only. Your own count-only row peaks at 513 MiB total / 537 renderer at 500 MiB, more than `fetch`+`arrayBuffer()` (247). Restate: flat only when the consumer is slower than the pipe (about 440 MB/s here); a fast consumer peaked near the file size (open question, line 231). The decision still follows (zero ext-host cost, below chunked messages' 1.1 to 1.4 GB), so only the wording changes.
Minor, fix in the same pass: line 171 "about 2.5 to 3 times the payload" is 2.2x for 4 MiB at 200 MiB (434 MiB), and the same text is at card line 39; line 171 "about 20 % faster" is 25 % at 500 MiB and nothing at 200 MiB; line 145 should say other VS Code instances (gcode-preview tests) ran during the measurements, as the notes say, since that adds noise to the timings.

**Fix round (PLT-31-worker, 2026-10-26).** All four review points fixed from the jsonl medians (recomputed). `docs/research/vscode-platform.md` §8: setup paragraph notes the concurrent VS Code instances (gcode-preview tests); the fetch bullet says memory is flat only when the consumer is slower than the pipe (~440 MB/s), with the count-only 513 MiB peak; "2.5 to 3 times" is now "2 to 3 times (2.2x at 200 MiB, 2.7x at 500 MiB)"; "about 20 % faster" is now "no faster at 200 MiB, 25 % at 500 MiB". Same corrections in decision items 1 and 2 above and in `.reference/notes/PLT-31-transport-spike.md`'s proposed decision. §2 and §7 untouched.

**Re-review passed (macOS part) (PLT-31-re-reviewer, 2026-10-26).** All four failed points are fixed. Medians recomputed from all 90 rows of `PLT-31-results-darwin*.jsonl` (all ok) match the §8 table. (1) Flat-memory claim: `docs/research/vscode-platform.md:170`, card decision item 1 and `PLT-31-transport-spike.md:87-88` now limit "flat" to a consumer slower than the pipe (441 MB/s), and give the count-only peak of 513 total / 537 renderer against `arrayBuffer()`'s 247. Open question at :231. (2) RSS multiple: 4 MiB peaks are 434/200 = 2.17x and 1344/500 = 2.69x, stated as 2.2x and 2.7x at :171, card item 2 and notes :90. (3) No-ack: 250 against 246 ms at 200 MiB, and 995 against 797 MB/s (+25 %) at 500 MiB, correct at :171. (4) Concurrent VS Code instances noted at :145. Other spot checks are right: 4x slower and a 1026 MiB renderer for one message at 500 MiB, 1 MiB 13 to 30 % slower, 4 MiB within 7.5 % of the fastest (16 MiB) at 500 MiB, chunked peaks 1097 to 1353 MiB. One nit, not blocking: :171 says "Throughput is 600 to 860 MB/s", but 4 MiB at 50 MiB is 583. Windows and Linux still wait on Q16, and the decision is proposed only. Card stays in review.
