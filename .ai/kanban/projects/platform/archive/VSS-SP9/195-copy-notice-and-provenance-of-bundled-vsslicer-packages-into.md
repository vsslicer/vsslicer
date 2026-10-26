---
id: 195
title: Copy NOTICE and PROVENANCE of bundled vsslicer packages into third-party notices
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP9"
docs: [.ai/audits/SP8-audit.md]
created: 2026-10-26
---

Finding 8 of the SP8 audit (`.ai/audits/SP8-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] `tooling/bin/third-party-notices.mjs:L73` keeps skipping `@vsslicer/*` packages for the licence check, but copies any `NOTICE`, `NOTICE.md` or `PROVENANCE.md` they ship into the notices file, under the package's name
- [x] A test with a fixture `@vsslicer/x` package carrying PROVENANCE.md shows it in the output, and one without it adds nothing
- [x] **Bounds:** a copied notice file over 1 MiB is refused with a named error, not inlined

## Progress

Changed only `vsslicer/modules/tooling/bin/third-party-notices.mjs` and `test/notices.test.mjs`.
@vsslicer/* packages are still skipped for the licence check (no problems raised), but any NOTICE, NOTICE.md or PROVENANCE.md they ship is copied into the notices file under a `## @vsslicer/x@ver` section; a package with none adds nothing. A file over 1 MiB is not inlined and reports `<pkg@ver>: <file> is larger than 1048576 bytes`. Extracted a shared `fenced()` helper.
Verified: `pnpm test` 58 pass (2 new), `pnpm lint` clean, `run.mjs checks` ran with no findings shown. Not done: header comment in the script still says @vsslicer is skipped (true for licence only).

**Review passed (sp9-rev-plt-195)**: ran in `vsslicer/modules/tooling` `pnpm test` (61 pass, 0 fail, including the 2 new notices tests), `pnpm lint` clean, `pnpm build` ok, `node scripts/run.mjs checks` exit 0. All three criteria hold: @vsslicer/* skip the licence check (L82-85) and get a `## name@ver` section with any NOTICE, NOTICE.md or PROVENANCE.md (L126-140); a package with none adds nothing; a file over 1 MiB is refused with `<pkg@ver>: <file> is larger than 1048576 bytes`. Mutation probes in a mktemp copy, each caught: own sections dropped (1 fail), size check removed (1 fail), @vsslicer put through the licence check (4 fail), PROVENANCE.md not matched (2 fail). Input is bounded: three file names per package, 1 MiB each. The merged `sections.sort()` gives the same order as sorting by key. In-place fix, comment only: the header comment (L7-L9) now says @vsslicer/* skip only the licence check and that their notices are copied in; lint and the notices tests still pass (20/20). Minor, left as is: the intro line still says "third-party packages" although our own packages' sections now appear under it.
