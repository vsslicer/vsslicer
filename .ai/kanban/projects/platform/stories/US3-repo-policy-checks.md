---
id: US3
title: A contributor who breaks licence, provenance, fixture-size or sign-off rules is stopped by CI
status: reviewed
epic: VSS:E1
---

The repository enforces its legal and hygiene rules mechanically: licence expression and SPDX headers (what Open VSX would reject), provenance for ported files, bundled-dependency licences with generated third-party notices, fixture size and provenance, and the DCO sign-off (D2, D10).

## Acceptance criteria

- [ ] `tools/check-licence` fails when a workspace `package.json` lacks `"license": "AGPL-3.0-or-later"`, when a source file lacks the SPDX header, or when a file with a `Ported from` line lacks an upstream copyright line; each case has a fixture that must fail
- [ ] The dependency check walks each extension's bundled production dependencies, fails on a licence outside the allow-list, and writes `THIRD-PARTY-NOTICES.md`; a fixture dependency marked `UNLICENSED` fails it
- [ ] `fixtures/` rejects any file over 5 MB and any folder without `PROVENANCE.md`; large inputs are generated in CI, not committed
- [ ] A pull request commit without `Signed-off-by` fails the DCO check (D10)

## Out of scope

- A contributor-licence agreement; signing VSIX files.
