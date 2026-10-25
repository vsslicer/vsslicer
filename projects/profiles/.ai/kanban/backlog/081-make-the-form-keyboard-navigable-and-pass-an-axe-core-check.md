---
id: 81
title: Make the form keyboard-navigable and pass an axe-core check
type: feature
priority: P0
effort: M
model: sonnet
area: [form]
story: US33
milestone: "VSS:M2"
depends_on: [76, 78, 79]
created: 2026-10-25
---

Full keyboard navigation and labelled controls on every page.

**Code:** `vsslicer/modules/profiles-extension/webview/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] A keyboard-only walk through a page and search reaches every control (Playwright)
- [ ] axe-core on the rendered form (each group page, search results, comparison) reports no violations

## Tasks

- [ ] Fix focus order and labels
- [ ] Add the axe test

## Progress

Not started.
