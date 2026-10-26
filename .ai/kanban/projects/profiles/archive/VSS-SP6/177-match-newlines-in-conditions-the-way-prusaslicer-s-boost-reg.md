---
id: 177
title: "Match newlines in conditions the way PrusaSlicer's Boost regex does"
type: bug
priority: P0
effort: S
model: opus
sprint: "VSS:SP6"
created: 2026-10-26
---

Found by PRF-8's third review (SP6): PrusaSlicer evaluates `=~` with `boost::regex` default flags (PrusaSlicer-2.9@b028299:src/libslic3r/PlaceholderParser.cpp:82, :681), where `.` matches a newline (Boost docs; unverified here). Our matcher follows JavaScript, where it does not. 144 of the 185 vendor regexes start with `.*`, and `printer_notes =~ /.*PRINTER_VENDOR_PRUSA3D.*/` on a multi-line note gives `compatible: false` here, so most real Prusa profiles would be filtered out wrongly.

**Code:** `vsslicer/modules/profile-api/src/domain/conditions/evaluate/regex.ts` (domain)

## Acceptance criteria

- [x] `.`, `^` and `$` behave as Boost's default (perl) syntax does under `regex_match`, with the source of each rule cited (Boost docs or PrusaSlicer code; mark unverified what cannot be checked locally)
- [x] `printer_notes =~ /.*PRINTER_VENDOR_PRUSA3D.*/` on a multi-line note is compatible (test), and the vendor differential test still passes

## Tasks

- [x] Confirm Boost's flags
- [x] Change the matcher
- [x] Tests

## Progress

Done (prf177-worker). PrusaSlicer runs `boost::regex_match(subject, boost::regex(pattern))` with default flags (PrusaSlicer-2.9@b028299:src/libslic3r/PlaceholderParser.cpp:76-82, :681, :712). No Boost clone locally; read boostorg/regex@a640597 (develop) online: `.` matches newlines by default (basic_regex_parser.hpp parse_match_any dont_care mask; perl_matcher_common.hpp match_wild with test_newline; states.hpp values), `^`/`$` are multi-line unless no_mod_m (parse_extended) and break at is_separator<char> = \n \r \f, never inside \r\n (match_start_line/match_end_line; regex_traits_defaults.hpp). Unverified: that PrusaSlicer's pinned Boost (>= 1.76, v5 headers) matches develop here.

- regex.ts: `.` is any code point; `^`/`$` also match at \n \r \f line breaks, not inside \r\n. Header comment cites the sources.
- Tests: differential oracle is now RegExp `(?:p)(?![^])` with `msuy` (exact for subjects whose only break is \n, which holds for the vendor subjects and random alphabet); new `printer.notes =~ /.*PRINTER_VENDOR_PRUSA3D.*/` multi-line test (our language spells it `printer.notes`); hand cases for \r, \f, \r\n, \u2028.
- Verified: `pnpm lint && pnpm build && pnpm test` in profile-api: 263/263 pass.
- Not done: Boost matches UTF-8 bytes, we match code points, so `.`/classes on a single non-ASCII char differ (shortcut comment in regex.ts).
- Files: vsslicer/modules/profile-api/src/domain/conditions/evaluate/regex.ts, test/conditions-evaluate.test.ts, CHANGELOG.md (Unreleased line, coordinator allowed). No lockfile change.

Changelog: PRF-177: condition regexes match newlines as PrusaSlicer's `boost::regex_match` does: `.` matches a newline, and `^`/`$` also match at \n, \r, \f line breaks (never inside \r\n).

Review passed (vwr389-prf177-reviewer): profile-api `pnpm install && pnpm lint && pnpm build && pnpm test` pass (264 tests, incl. PRF-14 lane files). Cited lines checked in .reference/repos/PrusaSlicer-2.9@b028299: :76-82 select boost, :681 and :712 call `boost::regex_match(subject, boost::regex(pattern))` with default flags on `std::string`, so Boost runs on `char` (UTF-8 bytes), which makes the code-point shortcut comment accurate; all 188 vendor regexes and 921 subjects are pure ASCII with no CR or FF, so it changes no vendor result. The rules in regex.ts agree with Boost's match_start_line/match_end_line/is_separator<char> as I know them (\n \r \f, \r\n middle excluded on both sides, `^` at the end after a break). Flags trick checked: `y` anchors at 0 without `^`, `(?![^])` anchors at the end without `$`, `s`+`m` equals Boost when the only break is \n, which holds for the vendor fixtures and the random alphabet. Own probe: an independent lookaround reference of the Boost rules against compileRegex on 4,000 random patterns (^ $ . \s \S \b [^a] \n \r, alternation, * ?) x 15 subjects over {a, b, space, \n, \r, \f, \r\n}: 60,000 cases, 0 differences. Domain only, no Boost code copied.
