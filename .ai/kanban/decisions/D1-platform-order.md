---
id: D1
title: Platform order: extensions on stock VS Code first, VSCodium build late
status: accepted
date: 2026-10-25
cards: [15, 17]
question: Q1
---

## Context

The roadmap (`.ai/plans/roadmap.md`, "Fork or extension") found that every product capability
fits the public extension API; a fork adds branding, a default gallery, built-in extensions and
proposed-API allowlisting, at the cost of a monthly rebase, signing certificates and CI on 6 to 9
targets (`docs/research/vscode-platform.md` §4). Q1 asked the owner which to do first.

## Decision

The owner answered Q1 on 2026-10-25: **"Stock VS Code first, fork late."**

- Every VSSlicer deliverable is an extension (plus the `vsslicer-agent` daemon) that runs on
  stock VS Code and VSCodium, published to open-vsx.org and the Microsoft VS Marketplace
  (roadmap "Marketplace plan"; the owner's answer did not object to publishing on both).
- The VSSlicer-branded VSCodium build and the self-hosted Open VSX are the last initiative (I11)
  and need the signing budget D5 says does not exist yet.

## Alternatives

- Fork from day one: branding and a curated gallery earlier, but every sprint pays the rebase
  and CI cost before any printing feature ships.

## Consequences

- Initiative order I1 to I10 is extension work; I11 is distribution.
- Nothing in I1 to I10 may depend on a proposed API or a `product.json` change. Where a
  capability needs one (WebGPU switches, codec flags), it is a fork-only enhancement in I11.
- If the owner reverses this later, I11 moves forward but the extensions stay the same code.
