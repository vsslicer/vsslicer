---
id: 214
title: Prepare the repository for its first public push to vsslicer/vsslicer
priority: P0
effort: M
model: opus
sprint: "VSS:SP13"
created: 2026-10-27
---

Owner request (2026-10-27): set GitHub up under the `vsslicer` org. Before the first push, apply Q12/Q21's planned cleanup.

Package: every app's `package.json`, git history. Layer: tooling.

- Repository URLs: `<owner>` placeholder becomes `https://github.com/vsslicer/vsslicer/tree/<name>@<version>/vsslicer/modules/apps/<dir>`. Each app takes a patch bump for it.
- History: remove `vsslicer/modules/profiles/data-orca/data/` (the vendored Orca data, untracked since PRF-190) from every commit; add `Signed-off-by: Jozsef Kiraly <fonix232@gmail.com>` to every commit (DCO, Q12); rebuild `main`'s sprint merges and re-point the `sprint/*` and `milestone/*` tags. Back up first.
- After the rewrite, drop the instruction that says commits need not carry a sign-off until the rewrite.

Done when: no commit touches `data-orca/data/`, every commit on `develop` and `main` is signed off (`scripts/check-dco.mjs`), the tags point at the rebuilt merges, `node scripts/run.mjs ci` passes, and `.git` has been repacked.