---
id: US68
title: "A macOS or Windows user installs a signed VSSlicer build, once the owner funds signing"
status: reviewed
epic: VSS:E69
---

As a macOS or Windows user, I want a signed (and on macOS notarised) installer, so that the OS does not warn me away. This is blocked on a signing budget (D5, D10): until then only unsigned Linux builds are released and unsigned local builds work for development.

## Acceptance criteria

- [ ] An owner budget decision for signing exists (spike) before any signing step is enabled
- [ ] With a yes: `codesign --verify` and `spctl` pass on macOS and `signtool verify` passes on Windows in CI; signed macOS and Windows installers are released
- [ ] With a no: the signing steps are skipped with a logged reason, CI stays green and the unsigned local build instructions are in the contributor docs

## Out of scope

- Buying certificates or accounts; Windows Store or Mac App Store distribution.
