---
id: 32
title: Implement createWebviewHtml and the CSP helper
type: feature
priority: P0
effort: S
model: sonnet
area: [webview-kit]
story: US8
milestone: "VSS:M1"
depends_on: [30]
created: 2026-10-25
---

`createWebviewHtml({ webview, scripts, styles })` with a fresh nonce and CSP `default-src 'none'` plus `webview.cspSource`, `script-src 'nonce-…'`, `style-src`, `img-src`, `worker-src` as the spike decides; `localResourceRoots` helper.

## Acceptance criteria

- [ ] Unit test asserts the policy has no `unsafe-inline` or `unsafe-eval` and each nonce differs per call
- [ ] `localResourceRoots` helper restricts to given folders (unit test)
- [ ] Policy documented per directive

## Tasks

- [ ] Implement HTML and policy builders
- [ ] Implement roots helper
- [ ] Write unit tests

## Progress

Not started.
