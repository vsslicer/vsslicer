---
id: US7
title: The webview layer's open questions are answered with measurements before the kit commits to a transport
status: reviewed
epic: VSS:E2
---

The platform team measures how to move 50 to 500 MB into a webview, whether WebGPU is available there and whether workers run under the kit's CSP, on Windows, macOS and Linux, and records each result as a decision so GCP and VWR build on facts.

## Acceptance criteria

- [ ] `postMessage` with transferables versus `fetch(asWebviewUri)` at 50, 200 and 500 MB on Windows, macOS and Linux, recorded as a decision with OS, GPU and VS Code version
- [ ] WebGPU `requestAdapter()` inside a webview on the same three platforms, recorded as a decision
- [ ] `Worker` from `blob:` and from `asWebviewUri` under the kit's CSP, recorded as a decision

## Out of scope

- Implementing a WebGPU backend; changing the transport beyond what the result requires (US8).
