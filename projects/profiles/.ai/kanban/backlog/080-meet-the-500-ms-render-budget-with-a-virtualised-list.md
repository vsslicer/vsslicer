---
id: 80
title: Meet the 500 ms render budget with a virtualised list
type: feature
priority: P0
effort: M
model: sonnet
area: [form]
story: US33
milestone: "VSS:M2"
depends_on: [76, 77]
created: 2026-10-25
---

Virtualises the field list so a process with every catalogue key set renders quickly.

**Code:** `vsslicer/modules/profiles-extension/webview/shell/virtual/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Opening a process with every catalogue key set renders in under 500 ms in the webview test harness (timing test on CI)
- [ ] Scrolling to the last field and searching to a far field both work with virtualisation on

## Tasks

- [ ] Add the virtual list
- [ ] Timing test

## Progress

Not started.
