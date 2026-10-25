---
id: 78
title: Reset the toolhead position on G28
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: GCP-78-worker
docs: [.ai/audits/2026-10-25-repo-audit.md]
created: 2026-10-25
---

Module `gcode-parser`, domain layer. `G1 X50`, `G28`, `G91`, `G1 X10` puts the head at X60 instead of X10 (finding 3). Found by the repository audit, finding in `.ai/audits/2026-10-25-repo-audit.md`.

## Acceptance criteria

- [x] `G28` sets position and origin to 0 for each named axis, or X, Y and Z when none is named
- [x] A test for the sequence above expects X10

## Tasks

- [x] Handle G28 in `Machine.handle`
- [x] Test
- [x] Release a patch version

## Progress

Done. `Machine.handle` G28: named axes (X/Y/Z; all if none, also `G28 W`) go to 0 with G92 offset cleared; E untouched; Marker kept. Tokeniser gained `bare`/`hasWord` so a valueless `G28 X` is seen. Test: `test/g28.test.ts` (failed first, 4/5, now passes); lint, 276 tests, build green; goldens unchanged. Released 0.8.3 (published, tarball dist checked, empty-store install + test green).

Files (under vsslicer/modules/gcode-parser): src/domain/machine.ts, src/domain/tokeniser.ts, test/g28.test.ts, README.md, CHANGELOG.md, package.json.
