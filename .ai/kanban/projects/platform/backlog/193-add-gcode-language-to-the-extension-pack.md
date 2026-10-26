---
id: 193
title: Add gcode-language to the extension pack
type: chore
priority: P2
effort: XS
model: sonnet
sprint: "VSS:SP7"
depends_on: [28]
created: 2026-10-26
---

SP5 created the `gcode-language` extension (G-code language, hover, completion, warnings). The extension pack (`vsslicer/modules/pack`) installs only ids listed in `shipped-extensions.txt`, and only published ids may be listed (VS Code cannot install an id that does not exist). No pack card covered gcode-language, so this card adds it once it is published.

**Code:** `vsslicer/modules/pack/shipped-extensions.txt` (module: `pack`, layer: n/a (manifest))

## Acceptance criteria

- [ ] `vsslicer.gcode-language` (its published id) is listed in `shipped-extensions.txt` and `pnpm build` copies it into `extensionPack`
- [ ] The pack's install test (PLT-29) shows it installed with the pack

## Tasks

- [ ] Add the id after the extension's first marketplace release
- [ ] Release the pack

## Progress

Not started. Blocked on publishing (PLT-28, Q8: marketplace accounts and tokens are the owner's).
