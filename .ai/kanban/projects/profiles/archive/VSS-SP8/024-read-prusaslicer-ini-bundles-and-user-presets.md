---
id: 24
title: Read PrusaSlicer INI bundles and user presets
type: feature
priority: P0
effort: M
model: sonnet
area: [importers]
story: US11
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [135, 119]
created: 2026-10-25
---

Parses `[vendor]`, `[printer_model:*]`, `[printer:*]`, `[print:*]`, `[filament:*]` and `*abstract*` sections, multi-parent `inherits`, `renamed_from`, `alias` and `compatible_*_condition` into a native section tree with line numbers.

**Code:** `vsslicer/modules/profiles-prusa/src/adapters/ini/` (module: `profiles-prusa`, layer: `adapters`)

## Acceptance criteria

- [x] Parses `PrusaResearch.ini@b028299` into 1 vendor, 35 printer models, 238 printers, 633 prints and 6 069 filaments before flattening
- [x] A malformed line yields a diagnostic with file and line and parsing continues
- [x] The native text of every key is kept verbatim (number formatting, key order)

## Tasks

- [x] Write the tokenizer and section reader
- [x] Keep native text and order
- [x] Write the tests against the pinned pack

## Progress

Not started.

- PRF-24-worker: DONE. Added `src/adapters/ini/{parse,index}.ts` (`parseIni(string|Uint8Array, file)` -> `{sections, diagnostics}`, linear scan; section kinds vendor/printer_model/printer/print/filament/root/other, `abstract` flag for `*name*`; entries keep verbatim trimmed values, order, line). Diagnostics reuse profile-api `Diagnostic` (code `malformed-line`); `ImportResult` not used (it holds mapped entities). Caps: 64 MiB input, 64 KiB line, 50 000 sections, 10 000 keys/section, 1 000 diagnostics. Golden counts verified by grep and by the test: 1/35/238/633/6069, 0 diagnostics (note: file is 1.5 MB, not ~10 MB). Header-less user preset files land in a `root` section; `#` and `;` are comment lines (boost ini_parser, as PrusaSlicer uses). Tests: test/adapters/ini.test.ts (13 tests, module total 44 pass), fixtures test/fixtures/ini/ + PROVENANCE.md. test/lint/build/checks pass.
- For coordinator, index.ts: `export * from './adapters/ini/index.ts';`
- CHANGELOG Unreleased: "Added: PrusaSlicer INI reader (`parseIni`): vendor bundles and user presets into a native section tree with line numbers, verbatim values and bounded resource use."
- Dependencies: none new.
- Review (sp8-reviewer-12, 2026-10-26 08:15): FAIL
  Checked: golden counts recounted by grep on PrusaResearch.ini@b028299c (1/35/238/633/6069 = all 6 976 headers, no empty sections, no duplicates): correct. Semantics compared with boost `read_ini` (Boost ini_parser.hpp lines 82-146, used by PrusaSlicer@b028299 `PresetBundle.cpp:1478`, `Preset.cpp:93`, `Config.cpp:687,698`). Scaling linear (2M tiny lines 89 ms vs 500k 25 ms; =-less flood, blank lines, 40k sections, 800 x 60k lines all linear; 64 MiB input 0.55 s; 1 MB line skipped). CRLF, lone CR (kept inside the value, as boost does), BOM fine. Layers fine, no shared files edited, no wall-time asserts. test/lint/build/checks pass.
  1. Meaning change after a rejected header, `src/adapters/ini/parse.ts:108-111`: the keys under a bad header are appended to the previous section (`[presets]\nprint=x\n[print:a\nk=v` puts `k` into `presets`; the test at `test/adapters/ini.test.ts:77-82` asserts it), or to a new `root` section if there is none. Fix: after a rejected header set the reader to drop keys (one diagnostic) until the next valid header, and change the test.
  2. Header parsing differs from boost, `parse.ts:108,116`: boost ends the name at the first `]` and ignores the rest of the line, so `[print:a] ; note` is a valid section upstream but a diagnostic here (and its keys then go to the previous section, finding 1); `[print:b]]x]` becomes name `b]]x` here, `b` upstream. Fix: `body.indexOf(']')` and slice to it.
  3. Silent duplicates, `parse.ts:116-117,142`: boost refuses the whole file on "duplicate section name" and "duplicate key name" (ini_parser.hpp:112-114,132-134); here both copies are kept with no diagnostic, so the later flattener picks one without anyone knowing. Fix: one `warning` diagnostic per duplicate section (Set of headers) and per duplicate key (Set per section), keeping file order; add a test.
  4. Invalid UTF-8 changes meaning silently, `parse.ts:83`: `new TextDecoder()` replaces bad bytes with U+FFFD (probe: bytes `k=\xFF\xC3` give value `��`, no diagnostic). Fix: decode with `{ fatal: true }` and return an error diagnostic (or decode leniently and add a diagnostic when U+FFFD appears in a Uint8Array input); add a test.
  5. Minor: boost drops empty sections (ini_parser.hpp:103-105,139-141), so an empty `[print:x]` is no preset in PrusaSlicer; here it is kept. Either drop it or document it on `IniSection`. `test/fixtures/ini/PROVENANCE.md` says the BOM is "as PrusaSlicer writes it"; PrusaSlicer writes no BOM (`Config.cpp:1037-1044`) and boost would reject a BOM'd first line; say the BOM is a leniency.
- Review (sp8-reviewer-17, 2026-10-26 08:20): FAIL
  Re-review of fix round 1 against Homebrew Boost 1.92 `ini_parser.hpp:64-146` and PrusaSlicer@b028299 (`PresetBundle.cpp:1526-1538` match headers with `boost::starts_with(section.first, "print:")`; no `std::locale::global` anywhere in `src/`, so boost trims with the classic locale: ASCII whitespace only). Findings 1-5 of sp8-reviewer-12 are fixed: (1) keys after an unclosed header are dropped with one diagnostic until the next valid header, also with no previous section and with a root section (probed); (2) name cut at the first `]`, rest ignored (`[print:a] ; note`, `[print:b]]x]` -> `b`, `[]x` -> ``); (3) one warning per duplicate section and key, both kept; 200 000 duplicate keys and 40 000 duplicate sections stop at 1 001 diagnostics with "further diagnostics suppressed"; (4) `fatal: true` decode refuses `\xFF\xC3`, overlong `C0 AF` and surrogate `ED A0 80` with one error, valid UTF-8 and a BOM in bytes still read; (5) empty sections documented on `IniSection.entries`, PROVENANCE.md corrected. Scaling linear: mixed headers/dup keys/unclosed headers 250k vs 1M lines 51/50 ms (section cap), unclosed-header flood 13/32 ms, dup-key flood 16/38 ms. Golden counts 1/35/238/633/6069/0 other, 0 diagnostics (test ran, not skipped). `pnpm test` 47 pass, lint, build, `node scripts/run.mjs checks` exit 0. Layers fine, no shared files edited, no wall-time asserts.
  1. Meaning change in header trimming, `src/adapters/ini/parse.ts:128`: `body.slice(1, close).trim()` uses JS `trim`, which strips Unicode whitespace (NBSP, U+FEFF, U+2028...). Boost trims ASCII whitespace only, so `[ print:a ]` is section ` print:a ` upstream (not a print preset, `starts_with` fails) but `kind: 'print', name: 'a'` here (probed). Keys already use the space/tab `trimmed`, so the two disagree. Fix: `const header = trimmed(body, 1, close);` and add a one-line test with an NBSP header landing in `other`.
  2. Minor, wrong diagnostic, `parse.ts:129-135`: `[a]\n[a]\nk=1` warns "boost read_ini (PrusaSlicer) would reject the file", but boost pops the empty first `[a]` before the duplicate check (`ini_parser.hpp:103-105` then `:110-112`) and accepts the file. Fix: keep a `Map<header, IniSection>` instead of the Set and warn only when the earlier section has entries (a later empty duplicate still warns, as boost throws on its header before knowing it is empty).
  3. Process: no fix note for round 1 in Progress; append one with the changes for findings 1-5 and these.
- Review (sp8-reviewer-22, 2026-10-26 08:30): PASS
  Re-review of fix round 2 (sp8-reviewer-17 findings). (1) Fixed: `src/adapters/ini/parse.ts:128` now `trimmed(body, 1, close)` (space/tab only); probed `[ print:a ]`, `[﻿print:a]`, `[ print:a]` -> kind `other`, name kept verbatim; `[\tprint:a\t]` -> `print`/`a`; test at `test/adapters/ini.test.ts:105`. (2) Fixed: `Map<header, IniSection>`, warn only when the earlier same-named section has entries (`parse.ts:129-136`); probed `[a][a]k=1` -> no warning, `[a]k=1[a]` -> one warning on line 3, `[a][b][a]k=1[a]k=2` -> one warning on line 5; test at `ini.test.ts:112`. (3) No worker fix note was appended; recorded here instead (rule 19, docs only): round 2 changed header trimming to ASCII space/tab and replaced the duplicate-header Set with a Map so an empty earlier section is not warned about, plus the two tests above. Golden counts on PrusaResearch.ini@b028299 rerun in scratch: vendor 1, printer_model 35, printer 238, print 633, filament 6069, 0 diagnostics (the in-module golden test is not skipped). Scaling: 20k/40k duplicate non-empty sections 16/28 ms (diagnostics capped at 1 001), 20k/40k empty duplicates 3/7 ms. `pnpm test` 49 pass, lint, build, `node scripts/run.mjs checks` exit 0. No regressions found.
