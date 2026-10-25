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
sprint: "VSS:SP3"
depends_on: [30]
created: 2026-10-25
---

`createWebviewHtml({ webview, scripts, styles })` with a fresh nonce and CSP `default-src 'none'` plus `webview.cspSource`, `script-src 'nonce-…'`, `style-src`, `img-src`, `worker-src` as the spike decides; `localResourceRoots` helper.

## Acceptance criteria

- [x] Unit test asserts the policy has no `unsafe-inline` or `unsafe-eval` and each nonce differs per call
- [x] `localResourceRoots` helper restricts to given folders (unit test)
- [x] Policy documented per directive

## Tasks

- [x] Implement HTML and policy builders
- [x] Implement roots helper
- [x] Write unit tests

## Progress

Done in webview-kit 0.2.0. `src/domain/html.ts` (`createWebviewHtml`, `contentSecurityPolicy`, `localResourceRoots`),
exported from `/host`, no runtime `vscode` import (takes `{ cspSource }` and URI strings). Tests: `test/html.test.ts`.
Policy table in the README. `worker-src blob:` stays unverified until the worker spike; the in-VS Code "no CSP
violation" check belongs to the epic's integration test, not this card.
