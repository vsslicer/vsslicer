---
id: 78
title: Add the search box and results to the form
type: feature
priority: P1
effort: S
model: sonnet
area: [form]
story: US31
milestone: "VSS:M2"
depends_on: [144, 74]
created: 2026-10-25
---

The search input in the webview, jump-to-field and highlight.

**Code:** `vsslicer/modules/profiles-extension/webview/search/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Typing `wall_line_count` jumps to the same field as `perimeters` (Playwright)
- [ ] Keyboard: `/` focuses search, Enter opens the first result, Escape clears

## Tasks

- [ ] Write the search UI
- [ ] Tests

## Progress

Not started.
