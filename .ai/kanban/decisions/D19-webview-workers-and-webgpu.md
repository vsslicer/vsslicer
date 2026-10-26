---
id: D19
title: "Webview workers start from blob: URLs; WebGPU is an opt-in upgrade over WebGL2"
status: accepted
date: 2026-10-26
cards: [PLT-33]
---

## Context

PLT-33 probed a webview built with the kit's unchanged `createWebviewHtml` (webview-kit 0.4.2) on
VS Code 1.100.0 and 1.143.1, on macOS 27.2 (M1 Pro) and a GPU-less Linux arm64 container
(`docs/research/vscode-platform.md` §7, `.reference/notes/PLT-33-webgpu-workers-probe.md`, raw
results `.reference/notes/PLT-33-results/`). `blob:` workers (classic and module) start, and so does
fetching the `asWebviewUri` file into a `blob:` URL; `new Worker(asWebviewUri)` fails on the
same-origin rule; `data:` workers are refused by the CSP; without `blob:` in `worker-src` every
worker fails. WebGPU works without flags on macOS; in the GPU-less container `requestAdapter()`
returns null and WebGL2 is software or absent. `crossOriginIsolated` is false. Windows and a Linux
desktop GPU are not measured yet (Q15).

## Decision (proposed)

- Keep the kit's `worker-src <cspSource> blob:`. Every worker starts from a `blob:` URL (fetch the
  bundled worker file, or inline it at build time); worker bundles are self-contained.
- WebGL2 stays the baseline (D6). WebGPU is an opt-in upgrade, detected with
  `await navigator.gpu?.requestAdapter()` and a non-null check, never `'gpu' in navigator`.
- The viewer needs a "no GPU" state for when neither works.
- A later webview-kit card drops the "unverified" note on `worker-src` in `src/domain/html.ts` and
  the README row, and may add a `startWorker(url)` helper.
