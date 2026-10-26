---
id: 30
title: "Read Cura definitions, extruders and variants"
type: feature
priority: P0
effort: L
model: opus
area: [importers]
story: US13
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [135, 136, 121]
created: 2026-10-25
---

Reads Cura `definitions`, `extruders` and `variants` with the Cura inheritance and stack order, keeping `=expr` values verbatim as `{expr}`.

**Code:** `vsslicer/modules/profiles-cura/src/adapters/definitions/` (module: `profiles-cura`, layer: `adapters`)

## Acceptance criteria

- [x] Golden counts at Cura@5bea2f8: 706 definitions, 544 extruders, 1 741 variants
- [x] Cura stack order (definition, extruder, variant, quality, user) resolved on a hand-built fixture
- [x] `=expr` values are stored as `{expr: ".."}` and never evaluated (E11 Risks)
- [x] Bounds (rule 25): `inherits` cycles and depth, file count and size caps across one call, JSON depth, resolved-entry budget, symbolic links and folder depth in the folder reader, case/Unicode/folder aliases of an id; each with a hostile test that fails without its bound

## Tasks

- [x] Read definitions and inherits
- [x] Read extruders and variants
- [x] Keep `{expr}` verbatim
- [x] Golden-count tests

## Progress

Not started.

**Dependency on PRF-23 removed at SP9 (sp9-coordinator, D21):** that card moved to M7 (owner-gated). This card's tests use synthetic or local `.reference` inputs and skip with a reason when those are absent; the owner-gated check lands with PRF-23.

**sp10-prf-30 (2026-10-26):** done, in `vsslicer/modules/profiles-cura/src/adapters/definitions/` (`read.ts`,
`inst-cfg.ts`, `folder.ts`) and `src/domain/stack.ts`; exports appended to `src/index.ts`, CHANGELOG line added.
Notes: `.reference/notes/PRF-30-cura-definitions.md`.
- Semantics re-implemented from Uranium@e65ccc1 and Cura@5bea2f8 (both LGPL-3.0, no code copied; cited per line in
  each file header): whole-chain deep-merged `overrides` applied to the settings tree, `value` (as `{expr}`) over
  `default_value` (`DefinitionContainer.py:203-205`, `:292-303`), shallow registry metadata (`:418-438`), version 2;
  `.inst.cfg` per `FastConfigParser.py:17-30`, `=x` -> `{expr: 'x'}` (`SettingInstance.py:172-173`), version 4;
  case-insensitive suffixes and `unquote_plus` ids (Cura ships 3 `.def.JSON` extruders); stack slots from
  `CuraContainerStack.py:412-431`, None falls through, extruder stack then global (`ContainerStack.py:294-305`).
- Golden: 2 991 files, 706 / 544 / 1 741, no error or warning diagnostics (15 info: builder_premium extruders override
  `extruder_prime_pos_abs`, which fdmextruder lacks; Cura drops them too). Max inherits depth 6, JSON depth 11.
- Stack fixture: definition (machine via global stack) < extruder definition < variant < quality < user, null falls through.
- Bounds and mutation probes (each bound removed in place, test run, file restored; all FAIL as expected):
  cycle check, inherits depth (both input orders and a 100 000-long leaf-first chain), JSON depth and the
  in-string bracket rule, file count, file size, total bytes, resolved-entry budget, alias normalisation, limit
  validation, folder symlink, folder depth, folder entries, folder file size, folder total, `=expr` kept, `value` over
  `default_value`, stack slot order, stack null fall-through, cfg `\n\t` continuation, cfg repeated header.
  Two first-round survivors were fixed by deleting code: a redundant inherits walk cap (the walk is now a Set, linear)
  and a dead `if (!section)` line in the cfg parser.
- Verify: `pnpm install`, `pnpm lint` clean, `pnpm build` clean, `pnpm test` 5 files / 70 tests passed (20 new);
  `node scripts/run.mjs checks` exit 0 (84/84).
- Left out (scope): `settable_per_extruder` / `limit_to_extruder` routing (callers pass the global stack alone),
  typing `.inst.cfg` literals by setting type (evaluator, cura-settings), mapping to unified entities.
  `src/adapters/archive/*` untouched.

**Review failed (sp10-rev-prf-30)** (2026-10-26)

Ran in `vsslicer/modules/profiles-cura`: `pnpm install` ok, `pnpm lint` clean, `pnpm build` clean, `pnpm test` 5 files /
70 tests passed (20 in `test/definitions.test.ts`, golden test ran, not skipped); `node scripts/run.mjs checks` exit 0.

Verified:
- Golden recount with `find` at Cura@5bea2f8 `resources/`: 706 `definitions/*.def.json`, 544 `extruders/*`, 1 741
  `variants/**/*.inst.cfg`; no duplicate basenames (case-folded), no subfolders under definitions/extruders, no symlinks.
- Every cited upstream line checked at Uranium@e65ccc1 / Cura@5bea2f8 and matches: `Resources.py:118-130` (first file
  of a name wins), `MimeTypeDatabase.py:110-114`, `LocalContainerProvider.py:395`, `DefinitionContainer.py:50, :203-205,
  :271-273, :292-303, :418-438, :481-491, :500-501, :513-534`, `InstanceContainer.py:54, :535-547, :618-622, :632`,
  `SettingInstance.py:172-173`, `FastConfigParser.py:17-30`, `CuraContainerStack.py:409-431` (user .. definition, 0..7),
  `ContainerStack.py:294-305`, `ExtruderStack.py:135-136`. Inheritance model is right: whole JSON deep-merged
  (`_mergeDicts`), merged `overrides` `update()` the setting found anywhere in `settings` so a child `default_value`
  keeps an inherited `value`; unknown override only logs (`is_valid` unused by `deserialize`); metadata is the parent's
  registry metadata then the file's own (shallow).
- Domain pure: `src/domain/stack.ts` imports a type only; `read.ts`/`inst-cfg.ts` do no I/O. No cross-module relative
  imports. LGPL: re-implemented (inst-cfg is a linear line parser, not the upstream regexes), headers cite and say so.
- Mutation probes (in place, restored, `cmp` clean): no NFC, no lowercase, no inherits depth, no budget, no JSON depth,
  `value` ignored, overrides under settings, metadata not inherited, no maxFiles, no total bytes, stack quality<->variant,
  folder link kind, folder file cap, cfg `\n\t` — all fail a test. Survivors: definitions accepted at any depth,
  `variant`/`definition_changes` swapped, `O_NOFOLLOW` removed (TOCTOU only; acceptable without a test).
- Hostile probes passing: Kelvin sign `K` vs `k`, `a%41` vs `aA`, `x+y` vs `x%20y` aliased; `__proto__` in settings,
  metadata, overrides and `.inst.cfg` stays an own key, no pollution; `curaStackValue('__proto__')` undefined; 300 chains
  x 32 over a 5 000-key root stop at the budget (400 resolved, diagnostics capped at 1 001); entry cap counts across
  the three folders in one call; 200 000-line cfg continuation linear.

Fixed in place (no behaviour change): `read.ts` `formula()` doc said "as Python would print"; Cura stores 3 674
non-string `value`s and `JSON.stringify` differs from `str()` (`1.0` -> `1`, list spacing), same value, not same text.

Problems:
1. `src/adapters/definitions/folder.ts:37` follows a symbolic link at the top: with `root/definitions -> /elsewhere/defs`,
   `readCuraResourceFolder(root)` returns `definitions/secret.def.json` read from outside the root, with no diagnostic
   (probe: `symlink(outside/defs, root/definitions)`; result `files: ['definitions/secret.def.json'], diag: []`). The
   header says it "never follows a symbolic link". `opendir` follows links, and the same holds for a subfolder swapped
   for a link between listing and `opendir` (`:58` then `:37`). Rule: no path component below `root` may be a link.
   Fix: `lstat` each top folder before `opendir` and refuse a link with the `symbolic link not followed` warning; for
   subfolders, `opendir` then compare `(dev, ino)` of the opened dir (`fstat`/`stat` after open vs the `lstat` taken at
   listing) or re-`lstat` and refuse a mismatch. Add a hostile test with a linked `definitions` folder that fails today.

Minor (not blocking, coordinator's call):
- `read.ts:105` accepts `.def.json` only directly under `definitions/`/`extruders/`; Cura's `Resources.py:116-125`
  walks subfolders, which the header cites. No test pins either way; say so in the header or accept nested files.
- Percent-decoded ids may be `..`, `a/b` or contain NUL (`%2e%2e`, `a%2Fb`, `%00`), as in Cura. Anything that later
  builds a path from an id must not trust it.
- `readCuraResourceFolder` opens files with `O_RDONLY` and no `O_NONBLOCK`; a regular file swapped for a FIFO after
  listing blocks `open`. Same TOCTOU class as problem 1.

