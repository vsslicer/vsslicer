---
id: D18
title: "Bulk data to webviews: fetch(asWebviewUri) for files, 4 MiB sendBuffer chunks for host-built buffers"
status: accepted
date: 2026-10-26
cards: [PLT-31, PLT-39]
---

## Context

PLT-31 measured ten transfer methods at 50, 200 and 500 MiB on macOS (M1 Pro, VS Code 1.143.1),
three runs each, all checksums matching (`docs/research/vscode-platform.md` §8,
`.reference/notes/PLT-31-transport-spike.md`, raw results `.reference/notes/PLT-31-results-darwin*.jsonl`).
At 500 MiB: `fetch(asWebviewUri)` read chunk by chunk took 1190 ms with no extension-host work;
kit `sendBuffer` with 4 MiB chunks 658 ms at about 2.7 times the payload in peak RSS (1 MiB, the
current default, 13 to 30 % slower); one single message 2618 ms with about 1 GiB in the renderer.
Fetch memory stays flat only when the reader is slower than the pipe (about 440 MB/s here).
Windows and Linux are not measured yet (Q16).

## Decision (proposed)

- Data that lives in a file (G-code, bgcode, 3MF, slicer output): the webview reads it with
  `fetch(asWebviewUri)` and `body.getReader()`, parsing as it arrives; `Range` for random access.
- Buffers the host builds in memory: webview-kit `sendBuffer` with 4 MiB chunks and a window of 4;
  `TRANSFER_DEFAULTS` changes from 1 MiB to 4 MiB (a follow-up webview-kit card).
- Never send one large message.

## Consequences

GCP-30's preview currently sends its move buffers with `sendBuffer` at the default 1 MiB; the
follow-up card changes the default. Revisit when Q16's Windows and Linux runs arrive.
