---
id: 217
title: Use fileURLToPath in the 3mf and Cura profile tests
type: bug
priority: P2
effort: XS
model: sonnet
sprint: "VSS:SP17"
created: 2026-10-27
---

Found by PLT-216: a file URL's `.pathname` used as a file path, which breaks on Windows:

- `vsslicer/modules/core/3mf/test/editPackage.test.ts:130`
- `vsslicer/modules/profiles/cura/test/fdm-material.test.ts:133`

Both point into `.reference/repos`, so they only run where the reference clones exist. Modules: `3mf`, `profiles-cura`; layer: test.

Done when: both use `fileURLToPath` (or `import.meta.dirname`), their tests pass, and `apps/gcode-preview/test/panel.test.ts:164` and `load.test.ts:55,119` are confirmed to pass the URL only to `Worker`, never to `fs` or `child_process`.