---
id: D2
title: VSSlicer is AGPL-3.0; engines may be bundled, upstream code may be ported
status: proposed
date: 2026-10-25
cards: [16, 5, 17]
question: Q2
---

## Context

The roadmap assumed Apache-2.0 for all VSSlicer code and therefore a strict posture toward the
AGPL slicers: clean-room reimplementation, engines only across a process boundary, no bundled
engine, no libbgcode/libvgcode/libpgcode, a lawyer for the contested points
(`.ai/plans/roadmap.md` "Licence posture"; `docs/research/licensing.md`). Q2 asked whether to
accept slicing through an external Orca CLI and to budget a lawyer.

## Decision

The owner answered Q2 on 2026-10-25: **"No need for AGPL contestation, this project will be
AGPLv3 too. Ignore Bambu's legal threats."**

Recorded as the planner reads it; approving this document confirms the reading:

1. **Licence.** Every VSSlicer repository, extension and library is `AGPL-3.0-or-later`. The
   single AGPL exception repository the roadmap planned (`vsslicer.engine-cura-wasm`) is no
   longer special; it can live in the monorepo.
2. **Porting is allowed.** Code from PrusaSlicer, SuperSlicer, OrcaSlicer, Bambu Studio, Cura,
   CuraEngine, libbgcode, libvgcode and libpgcode (all AGPL-3.0) may be ported or adapted, with
   the original copyright notices and a per-file provenance line (`Ported from
   OrcaSlicer@09aa0114:src/...`). GPL-3.0 code (Klipper, Marlin, Moonraker, klipper_estimator's
   planner) may be combined with AGPL-3.0 code under GPL-3.0 §13; the same provenance rule
   applies. The roadmap's clean-room rule is replaced by this provenance rule.
3. **Engines.** The process boundary is now an engineering choice (crash containment, memory),
   not a licence one. The first slicing release still drives the upstream OrcaSlicer CLI
   (fastest route to a tested end-to-end loop: I5), but an in-process or bundled engine
   (CuraEngine or libslic3r compiled to WASM, or a bundled Orca build) is a normal epic in I10,
   and CuraEngine may be driven over Arcus with `Cura.proto` bundled.
4. **Obligations we take on.** For every binary we distribute (VSIX, bundled engine, fork
   installer) we publish the corresponding source, including the exact engine source revision
   we built. Every `package.json` carries `"license": "AGPL-3.0-or-later"`. Third parties cannot
   build proprietary products on our code (this answers roadmap owner question 19).
5. **Bambu.** The Bambu printer work proceeds on the owner's responsibility regarding Bambu's
   terms (see D3). We still do not redistribute Bambu's closed binaries or private keys; we use
   open-source implementations of the protocol.
6. **Profile data.** Orca and Bambu profile trees (AGPL) may be bundled as data packages. Prusa
   `-fff` profile repositories have no licence and are fetched from upstream (D4).

## Alternatives

- Apache-2.0 with the clean-room and process-boundary rules, as the roadmap recommended. More
  work (own planners, own 3MF dialect code), a lawyer for the contested points, but permissive
  reuse by others.
- MIT: as Apache-2.0 without the patent grant.

## Consequences for the plan

- I1 (G-code) may port libvgcode's rendering model and libbgcode's block format instead of
  rewriting them from the spec; the Klipper planner may follow `klippy/toolhead.py`.
- I2 (3MF) may port `bbs_3mf.cpp` dialect handling.
- I10 gains an "embedded engine" epic (SLC) and drops the separate-repository constraint.
- `docs/research/licensing.md` stays as the record of the Apache-2.0 analysis; its Implications
  1 to 3 no longer apply.
- If the owner picks differently, revert to the roadmap's licence posture: every epic that says
  "port" becomes "clean-room", and the engine epics keep the process boundary.
