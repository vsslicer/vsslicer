---
id: 8
title: "Evaluate conditions over a context with Prusa's failure semantics and a fuzz test"
type: feature
priority: P0
effort: M
model: sonnet
area: [evaluator]
story: US3
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [7]
created: 2026-10-25
---

`evaluate(expr, context)` returns a boolean; an unparsable condition returns compatible plus a diagnostic, as PrusaSlicer does.

**Code:** `vsslicer/modules/profile-api/src/domain/conditions/evaluate/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [x] `evaluate` returns the expected value for every operator over a context holding `printer`, `nozzle`, `surface`, `feeder`, `material`, `process`
- [x] A parse failure returns `{compatible: true, diagnostic}` (matches `Preset.cpp:390-421` behaviour) and never throws
- [x] A fuzz test of 10 000 random inputs never throws outside the module's own error type
- [x] Regex literals run with a length cap on the input so a pathological pattern cannot hang the test

## Tasks

- [ ] Write the evaluator
- [ ] Add the failure semantics
- [ ] Add the fuzz test

## Progress

Done: `evaluate(expr: string | Expr, context)` -> `{compatible, diagnostic?}` in `src/domain/conditions/evaluate/evaluate.ts`, exported from `src/index.ts`. Builds on PRF-7's AST (no parser files edited).
- Failure semantics (PrusaSlicer-2.9@b028299 `Preset.cpp:399-406`, `PlaceholderParser.cpp:565,573,744,903`; AGPL, behaviour confirmed only, no code copied): parse error, unknown key, type mismatch, non-boolean truth test, ordering on non-numbers all give `{compatible: true, diagnostic}`; evaluate never throws. `and`/`or` evaluate both operands (`PlaceholderParser.cpp:735-746`), order-independent.
- Regex (fix2, design change): runs on our own backtracking-free matcher, `src/domain/conditions/evaluate/regex.ts` (~200 lines). Why: two budget heuristics over RegExp failed review; a Thompson NFA simulation is O(states x subject) by construction, so there is no budget to get wrong. The pattern is syntax-checked with `new RegExp('^(?:p)$','u')` (never executed), parsed over the regular subset (literals, `.`, classes, safe escapes, `^ $ \b \B`, groups, `|`, all quantifiers incl. nested and lazy; backreferences, lookarounds, named groups, `\p`/`\u`/`\x` rejected), compiled to an NFA with counted repeats expanded, capped at `MAX_REGEX_STATES` = 5000 (size computed before building, so `(){999999999}` is rejected without work). Single-char predicates are per-code-point RegExps, memoised per step. Full-match semantics unchanged. `regexPaths`/`MAX_REGEX_PATHS` removed (exported only in this unreleased card); `MAX_REGEX_STATES` exported. Pattern cap 200, subject cap 512 kept.
- Verified: `pnpm install && pnpm lint && pnpm build && pnpm test` in profile-api pass (lint now clean, 248 tests). All reviewer probes (rr8/p.mjs list) plus the old "rejected" catastrophic patterns now run with hand-checked answers in <100 ms each (max 35 ms cold); at the state cap on 'a'x512, 14-17 ms warm. Differential vs RegExp full match: all 185 vendor regexes x (921 real subjects, new fixture `test/conditions-vendor-subjects.txt` from PrusaSlicer-settings@a40f669 printer_notes/printer_model values and preset names, + 40 random subjects each): 0 mismatches, 701 positives; 2000 random patterns x 10 short subjects (incl. astral/non-ASCII, assertions, lazy): 0 mismatches.
- Deviations/unverified: `in` with mixed types is a mismatch error. Boost regex (Prusa) may let `.` match a newline where JS does not; printer_notes holds newlines, so `.*X.*` may differ from Prusa on multi-line notes (unverified, not changed: suggest a follow-up card). overrides.ts:32: tsc is clean, nothing to fix.
Files: src/domain/conditions/evaluate/evaluate.ts, src/domain/conditions/evaluate/regex.ts (new), src/index.ts (1 export line), test/conditions-evaluate.test.ts, test/conditions-vendor-regexes.txt, test/conditions-vendor-subjects.txt (new fixture, AGPL vendor data), CHANGELOG.md (from the first pass). No dependency changes.
Changelog: PRF-8: `evaluate(expr, context)` returns `{compatible, diagnostic?}` with PrusaSlicer failure semantics (both `and`/`or` operands evaluated) and full-match regexes on a linear-time NFA matcher (no catastrophic backtracking).
- Review passed (prf8-rereview2): lint/build/test clean in profile-api (248 tests). regex.ts read: Thompson simulation, no backtracking, closure deduped per position by `mark[t] === gen`, so each step visits each state once (O(states x subject)); `size()` runs on the AST before `build`, and `(){999999999}`, `(?:a{1000}){1000}`, `(?:(?:a{99}){99}){99}` are rejected in <0.1 ms. Own differential fuzz (rr8b/fuzz.mjs, 5 seeds, 40 000 patterns with classes/ranges/negated/empty classes, `[\b]`, escapes, `^ $ \b \B`, empty alternatives, capture and non-capture nested quantified groups, lazy and counted quantifiers, astral and lone-surrogate subjects): ~633 000 cases, ~170 000 positives, 0 mismatches against `RegExp('^(?:p)$','u')`, 0 rejects inside that grammar. Adversarial patterns on 512-char subjects (rr8b/adv.mjs, fix8b/probe.mjs): worst 21 ms. Fixture header cites PrusaSlicer-settings@a40f669 (clone is at a40f669), AGPL-3.0 data in an AGPL-3.0-or-later module: fine. Follow-up card needed (P0, profile-api/domain): PrusaSlicer-2.9@b028299:src/libslic3r/PlaceholderParser.cpp:82,681 uses boost::regex with default flags, where `.` matches a newline (Boost docs, unverified here); 144 of the 185 vendor regexes start with `.*`, and `printer_notes =~ /.*PRINTER_VENDOR_PRUSA3D.*/` on a multi-line note gives `compatible: false` here (rr8b/nl.mjs). That is a dialect difference outside this card's criteria, so it goes on its own card (check `^`/`$` line semantics as well).
