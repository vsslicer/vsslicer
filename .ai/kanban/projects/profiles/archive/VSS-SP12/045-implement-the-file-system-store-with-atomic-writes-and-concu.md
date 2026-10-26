---
id: 45
title: Implement the file-system store with atomic writes and concurrent-edit protection
type: feature
priority: P0
effort: M
model: opus
area: [store]
story: US20
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [44, 135]
created: 2026-10-25
---

Reads and writes one JSON file per user entity under `.vsslicer/profiles/` and vendor entities under a given global folder; writes go through a temp file and rename, and compare `meta.updated`.

**Code:** `vsslicer/modules/profiles/src/adapters/fs-store/` (module: `profiles`, layer: `adapters`)

## Acceptance criteria

- [x] Two simulated windows writing the same workspace never lose an edit: the second writer gets a conflict error carrying both versions (test with two store instances)
- [x] An unchanged entity is never rewritten (mtime test)
- [x] A crash between temp write and rename leaves the old file intact (fault injection test)
- [x] Bounds (added by sp12-prf-45, rule 25): the read walk reuses `readInstalledFolder` (its entry, file, byte and
  depth caps, links never followed); an id is 1..256 characters (256 accepted, 257 refused); a file name from an id is
  at most 200 encoded characters, longer ones get a sha256 name (200 kept, 201 hashed), and a `/` or `..` in an id
  never leaves the kind folder; the file on disk read for the conflict check is at most `MAX_FILE_BYTES` (cap read,
  cap + 1 refused); a stale lock is broken only after more than 30 s (30 000 ms busy, 30 001 ms broken); `__proto__`
  and `constructor` ids round-trip (indexes are `Map`s).

## Tasks

- [x] Write the adapter
- [x] Atomic write and conflict check
- [x] Fault-injection tests

## Progress

Not started.

2026-10-26, sp12-prf-45 (macOS arm64; the module CI gate runs on Linux):

- Code: `vsslicer/modules/profiles/src/adapters/fs-store/fs-store.ts` (adapters layer), tests
  `vsslicer/modules/profiles/test/adapters/fs-store.test.ts` (16 tests). No upstream port; nothing AGPL-third-party.
- `createFsProfileStore({ user, bundled, fs?, now? })` is a PRF-44 `ProfileFiles` port (feed it to
  `createProfileStore`) plus `write(kind, entity, layer = 'user')` and `diagnostics` (invalid JSON, unreadable
  folders from the last read). Files live at `<root>/<kind folder>/**/*.json` (`printer_model` -> `printer-model/`,
  matching the extension's jsonValidation globs); identity is `id`, and a write goes back to the file the id was read
  from, else `<root>/<kind>/<encodeURIComponent(id)>.json`.
- Write protocol: exclusive lock file `<file>.lock` (`wx`; held by another writer -> `ProfileStoreBusyError`; older
  than 30 s -> broken as a crashed writer's); read the disk file; deep-equal to the entity -> no write; a different id
  on disk (case alias), not-JSON content, or `meta.updated` different from the entity's (the version it was read at)
  -> `ProfileConflictError { path, mine, theirs }`; else stamp `meta.updated` (strictly after the previous stamp, so
  same-millisecond saves still conflict), write `.<file>.<uuid>.tmp` (`wx`, `flush`), rename over the file. A failed
  write or rename removes the temp file; the lock is always released. Temp and lock files are not `.json`, so reads
  skip them.
- Criterion 1 (two windows): "two windows: the second writer gets a conflict carrying both versions" (two store
  instances; mine = B's edit, theirs = A's saved version; B's merge then writes with a strictly newer stamp; A's stale
  save conflicts), plus "saving at once: exactly one wins" (`Promise.allSettled`, lock path) and "creating the same new
  entity". Probes: conflict compare replaced by `false` -> fails; lock creation removed -> "saving at once" fails;
  strictly-after stamp removed -> fails; same-id check removed -> alias test fails.
- Criterion 2 (unchanged never rewritten): file mtime set to 2020 with `utimes`, same entity with reversed key order
  written back -> `written: false`, mtime unchanged, write calls counted (1 writeFile for the lock, 0 renames). Probe:
  deep-equal skip removed -> fails.
- Criterion 3 (crash): injected `rename` throws and `rm` does nothing (a dead process cleans nothing) -> old bytes
  intact, temp file left, the next session reads only the old entity with no diagnostics and breaks the stale lock to
  save. Probe: temp write pointed at the target file (non-atomic) -> fails.
- Other guards, each probed (mutation removed -> a test fails): stale lock `>` -> `>=`; `.json` filter; id cap; file
  name cap `<=` -> `<`; missing-root skip; temp cleanup on failure; lock release; known-path reuse; unknown kind;
  unconfigured layer; disk file size cap. 17/17 probes fail as expected (script in a scratch dir, file restored).
- Verification: profiles `pnpm install`, `pnpm lint` (exit 0), `pnpm build` (exit 0), `pnpm test` 10 files, 97 tests
  pass; `node scripts/run.mjs checks` exit 0. (During one lint run another worker's in-place probe had
  `src/adapters/installed/installed.ts` broken; rerun after it was restored passed.)
- Limits: the walk caps apply per root (two roots, so one read takes at most twice them; noted in code). A lock is a
  plain file, so a writer that hangs (not crashes) for over 30 s can have its lock broken; the conflict check still
  catches a change made before its rename only if that change landed before its read.

Release lines:

- CHANGELOG (profiles): "Add the file-system store: one JSON file per entity, temp-file-and-rename writes, a lock and
  a `meta.updated` check that turn a second window's save into a conflict carrying both versions (PRF-45)."
- `src/index.ts`: `export * from './adapters/fs-store/fs-store.ts';`

**Review failed (sp12-rev-prf-45)**, 2026-10-26, macOS arm64:

- Ran in `vsslicer/modules/profiles`: `pnpm install` 0, `pnpm lint` 0, `pnpm build` 0, `pnpm test` 10 files / 96
  tests pass (fs-store 16/16); `node scripts/run.mjs checks` exit 0. Layering fine (adapters -> application only, no
  VS Code, no cross-module relative imports); SPDX header present; no upstream port.
- Mutation probes (in a `mktemp -d` copy, file restored): 23 behaviour mutations, all killed: conflict compare,
  same-id check, deep-equal skip, lock `wx` -> `w`, stale `>` -> `>=`, stale never broken, strict-after stamp, temp
  write to the target, temp cleanup, lock release, id cap +1 / -1, empty id, file name `<=` -> `<` and +1, no
  `encodeURIComponent` (traversal test), size cap `>=` and +1, `.json` filter, known-path reuse, missing-root skip,
  kind check, `known` index. Every criterion has a probe in Progress.
- Hostile probe: 200 rounds of two stores breaking the same stale lock at once (`Promise.allSettled`): 0 lost edits
  in-process.

Problems:

1. `test/adapters/fs-store.test.ts:229-242` (and :209): the stale-lock bound is asserted with `STALE_LOCK_MS`
   imported from the code under test. Probe: `STALE_LOCK_MS = 60_000` in `fs-store.ts:21` -> all 16 tests still
   pass, though the criterion fixes it at 30 000 ms busy / 30 001 ms broken. Fix (SP12 rule: a bound's test asserts
   the exact cap, never a value taken from the code): use the literals `30_000` and `30_001` (or
   `expect(STALE_LOCK_MS).toBe(30_000)` first).
2. `test/adapters/fs-store.test.ts:251-257`: same for `MAX_FILE_NAME`; the criterion says 200 kept, 201 hashed. The
   probe `MAX_FILE_NAME = 240` is caught only by accident (the 256-character id stops being hashed). Fix: literal
   `200` / `198 + '/'` (201 encoded) and `expect(MAX_FILE_NAME).toBe(200)`.
   (`MAX_FILE_BYTES` is PRF-36's cap and the criterion names the constant, so using it there is fine.)

Advisory, not blocking:

- `fs-store.ts:124-131`: breaking a stale lock is `stat` then `rm` then `wx`; across processes, writer B can `rm`
  the fresh lock writer A just created after both saw the same stale one, so both hold it and the later rename wins
  without a conflict. Needs a crash, then two windows saving the same entity within milliseconds; not reproduced
  in-process. Worth one line in the Limits.
- `fs-store.ts:89`: an id with a lone surrogate (`'\uD800'`) makes `encodeURIComponent` throw `URIError` (refused
  before the lock, nothing written). A clearer error message would help.
- A file read from disk with a name near 255 bytes gets a `.lock` / `.<name>.<uuid>.tmp` name over NAME_MAX, so its
  write fails with ENAMETOOLONG (nothing lost).

**Coordinator fix and re-review (sp12-coordinator, rule 29):** the stale-lock and file-name tests now use the literals (30 000 busy, 30 001 broken; 200 kept, 201 hashed) and assert the constants; probes `STALE_LOCK_MS = 60_000` and `MAX_FILE_NAME = 240` each fail 1 of 16, restored. Limits (from the review): breaking a stale lock is stat, rm, create, so two processes recovering from a crash can both hold it and one edit can be lost without a conflict; a lone-surrogate id throws `URIError` (nothing written); a near-255-byte name gets lock and temp names over the limit (ENAMETOOLONG, nothing lost). Pass.
