---
id: I11
title: Distribution: the VSSlicer build, own marketplace, themes
status: approved
milestone: M6
order: 11
projects: PLT
phases: 11
---

## Problem

A printing-focused editor with its own default gallery and branding needs a VSCodium-based build, signed installers and a self-hosted Open VSX; the owner wants this but it needs a budget (D5) and every extension first (D1).

## Outcome

A VSSlicer build from patched VSCodium scripts (`product.json` branding, our Open VSX with open-vsx.org upstream, built-in VSSlicer extensions, Electron switches if the I1 and I7 spikes call for them), signed and notarised installers, update through GitHub releases, the self-hosted Open VSX, and `vsslicer.themes`.

## Roadmap phases and feature-matrix rows

Roadmap phase(s) 11 (`.ai/plans/roadmap.md`). Rows (`docs/research/feature-matrix.md`): §16 In-app extension marketplace (own registry), Themes.

## Exit criteria

- Reproducible build; smoke tests on every target (install, open fixtures, slice with a downloaded engine)
- Gallery tests: search, install, update from our registry with upstream fall-through; `ovsx verify` on signature archives
- A rebase rehearsal on the next upstream VSCodium release is documented

## Order: 11 of 11

Last: it depends on every extension existing and on money that does not exist yet (D5). Themes ride along because the owner asked for them last.

Order rationale follows the roadmap's rule: testability first (libraries checked against deterministic fixtures and external oracles), usability next (daily workflows on proven foundations), functionality last (breadth, optional engines, the fork).
