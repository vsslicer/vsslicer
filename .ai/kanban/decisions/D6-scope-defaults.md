---
id: D6
title: Scope defaults: FDM only, WebGL2 only, Spoolman optional
status: accepted
date: 2026-10-25
cards: [17]
question: Q6
---

## Context

Q6 asked whether the roadmap's scope defaults are acceptable: FDM only until phase 10 with SLA
deferred, WebGL2-only rendering until a WebGPU probe passes in webviews, and Spoolman optional
for the filament inventory (local store by default, sync when a Spoolman exists).

## Decision

The owner answered Q6 on 2026-10-25: **"All acceptable."**

- FDM only. SLA rows in the feature matrix (§8, and the SLA rows of §1) are P3 and have no epic
  until an initiative for them exists.
- WebGL2 is the rendering baseline in `@vsslicer/webview-kit`; a WebGPU probe is a spike in I1,
  and WebGPU is an optional path only if the probe passes on all three platforms.
- Filament: local inventory by default; Spoolman sync is an optional epic in I8; Moonraker's
  Spoolman proxy is used when present.

## Alternatives

Each default has its alternative in the roadmap: SLA pipeline, WebGPU-first renderer, Spoolman
as the store of record.

## Consequences

- VWR and GCP epics assume WebGL2 (about 28 bytes per move, data textures, instanced segments).
- FIL's data model is a Spoolman-compatible superset so that either store works.
