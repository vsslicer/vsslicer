---
id: 149
title: "Apply the overlay, the removal list and our patches to the pinned VSCodium sources"
type: feature
priority: P0
effort: M
model: opus
area: [fork]
story: US65
milestone: "VSS:M6"
sprint: "VSS:SP15"
depends_on: [147, 148]
created: 2026-10-25
---

The build script runs VSCodium's own preparation, then our steps: write the overlay, delete the folders on the removal list, apply our patch series in order. A patch that no longer applies fails the build by patch and hunk. VSCodium does the same with `git apply --ignore-whitespace` and stops on any reject (`vscodium@be70704:utils.sh:45-69`). Research: `docs/research/vscodium-build.md` §1, §2.

**Code:** `src/adapters/apply.ts`, `src/application/prepare.ts`, `patches/series`, `patches/remove.json` (repo: `vsslicer/vsslicer-build`, layers: `application` and `adapters`)

## Acceptance criteria

- [ ] `pnpm prepare-sources` produces the patched tree from the pin, our overlay (PLT-148), `patches/remove.json` and `patches/series`; a failing patch names the patch and the hunk, a missing removal path names the path
- [ ] Each of our patches has a header saying why, the upstream lines it touches (`vscode@<commit>:path:line`) and its licence (AGPL-3.0-or-later)
- [ ] `pnpm check-patches` runs `git apply --check` for every patch against a fresh fetch without building, so agents verify patches in minutes
- [ ] A test with a deliberately broken patch fails with its name

## Tasks

- [ ] Prepare and apply scripts
- [ ] Series and removal files
- [ ] The check command and the broken-patch test

## Progress

Not started.
