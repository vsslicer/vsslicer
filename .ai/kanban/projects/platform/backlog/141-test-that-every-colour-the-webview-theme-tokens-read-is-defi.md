---
id: 141
title: Test that every colour the webview theme tokens read is defined in each theme
type: chore
priority: P3
effort: S
model: sonnet
area: [themes]
story: US69
milestone: "VSS:M6"
sprint: "VSS:SP50"
depends_on: [134, 135, 37]
created: 2026-10-25
---

Webview colours follow the theme through the E2 theme tokens; this test lists the `--vscode-*` variables the token helper reads and asserts each is defined by all four themes.

**Code:** `vsslicer/modules/apps/themes/test/webview-tokens.test.ts` (module: `themes`, layer: n/a (tests))

## Acceptance criteria

- [ ] The test imports the list of read variables from the published `webview-kit` and fails naming the theme and variable when one is missing
- [ ] All four themes pass

## Tasks

- [ ] Write the test
- [ ] Wire it into CI

## Progress

Not started.
