---
id: 3
title: "Define `SlicerEngine`, `SliceJob` and the progress, warning and layer event stream"
type: feature
priority: P0
effort: M
model: opus
area: [engine]
story: US6
milestone: "VSS:M3"
depends_on: [2, PRF-135]
created: 2026-10-25
---

The contract every engine adapter implements: `slice(job): AsyncIterable<Progress|Warning|Layer>` resolving to staged output paths, plus `cancel()`, as in `slicing-engine-embedding.md` section 6 item 1. `SliceJob` carries the input 3MF or models, plate, the resolved profile (type from `profile-api`) and overrides.

**Code:** `vsslicer/modules/slicer-api/src/domain/...` (module: `slicer-api`, layer: `domain`)

## Acceptance criteria

- [ ] Types and a `SlicerEngine` interface compile and are exported; a type-level test pins the field list
- [ ] Outputs are staged paths in the job's temp directory; moving them into `.vsslicer/sliced/` is not the engine's job (documented)
- [ ] Progress is determinate (0-100) or indeterminate; Warning carries key, message and optional file and line
- [ ] Every exported symbol has a doc comment; the README shows a fake-engine example

## Tasks

- [ ] Write the types
- [ ] Type tests
- [ ] README example

## Progress

Not started.
