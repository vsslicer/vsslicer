---
id: 21
title: Add the VSIX packaging task with content assertion and size budget
type: feature
priority: P0
effort: M
model: sonnet
area: [publishing]
story: US5
milestone: "VSS:M1"
sprint: "VSS:SP2"
depends_on: [3, 12]
created: 2026-10-25
---

`package` task per extension: esbuild bundle, then `vsce package --no-dependencies` (vsce does not follow pnpm symlinks), then assert the file list and size.

## Acceptance criteria

- [ ] VSIX contains exactly bundle, `package.json`, `LICENSE`, `THIRD-PARTY-NOTICES.md`, `README.md`, `CHANGELOG.md` and declared assets; no `node_modules`, tests or `.map` files
- [ ] Size is printed; a per-extension budget in `package.json` fails the job when exceeded (test with a bloated fixture)
- [ ] `repository` link at the release tag and licence expression are present

## Tasks

- [ ] Write `tools/package-extension`
- [ ] Add the assertions
- [ ] Add the bloated and map-file negative fixtures
- [ ] Wire `package`

## Progress

Not started.
