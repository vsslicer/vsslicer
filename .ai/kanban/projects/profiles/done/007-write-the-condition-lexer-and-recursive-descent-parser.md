---
id: 7
title: Write the condition lexer and recursive-descent parser
type: feature
priority: P0
effort: M
model: opus
area: [evaluator]
story: US3
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [2]
created: 2026-10-25
---

Parses the shared `when` expression language into an AST: literals, comparisons, `=~ /re/`, `!~`, `in [..]`, `and`/`or`/`not` and parentheses over `printer.* nozzle.* surface.* feeder.* material.* process.*`.

**Code:** `vsslicer/modules/profile-api/src/domain/conditions/parse/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [x] Grammar tests for every operator and namespace in the epic; precedence `not` > `and` > `or`
- [x] A parse error carries offset and a message; no function calls or assignments parse (negative tests)
- [x] No `eval`, `Function` or dynamic import in the module (a lint rule or test greps for them)

## Tasks

- [x] Write the lexer
- [x] Write the parser and AST types
- [x] Write the grammar tests

## Progress

Done (prf7-worker). `parseCondition(src): Expr` in `src/domain/conditions/parse/` (ast.ts, lexer.ts, parser.ts, index.ts), exported from `src/index.ts`. Pure TS, no I/O.

- AST: `literal`, `ref` (namespace + path), `compare`, `match` (`=~`/`!~`, pattern source), `in` (literal list or ref, `not in`), `not`, `and`/`or`; every node carries `offset`. Bare operand = truth test.
- Errors: `ConditionParseError` with `offset` and message (assignment `=`, function calls, unknown/unnamespaced refs, unterminated string/regex, invalid regex, bad lists, trailing tokens).
- Decisions for the reviewer: `!` is accepted as an alias of `not` (Prusa conditions use it, profiles.md:47/:77; :333 says conversion only rewrites identifiers). No `[n]` indexing. Comparisons bind tighter than `not` and do not chain. Regex validated at parse time via `new RegExp`, no flags.
- Licence: grammar written from docs/research/profiles.md §6 (:227-242, :49, :77) only; PrusaSlicer/Orca PlaceholderParser (AGPL-3.0) was not read, so no AGPL code was consulted or reused.
- Verified: `pnpm install && pnpm lint && pnpm build && pnpm test` pass (90 tests). Tests in `test/conditions-parse.test.ts`: real conditions from profiles.md (:47 translated, :77, :230, :237-242), every namespace/operator, precedence, 21 negative cases with offsets, and a grep test for `eval(`, `Function(`, `import(` over `src/domain/conditions`.
- Not done: span end offsets on nodes; regex flags.

Files: src/domain/conditions/parse/{ast,lexer,parser,index}.ts, src/index.ts (one export line), test/conditions-parse.test.ts. No dependency or lockfile change.

Changelog: PRF-7: `parseCondition` lexer and recursive-descent parser for `when` conditions, typed AST and `ConditionParseError` with offsets.

Review failed (prf7-reviewer): lint/build/test pass (90), grammar matches profiles.md §6 (:227-242), precedence not > and > or and `!` alias verified, error offsets correct, regex validated by `new RegExp` only (never run), AGPL header matches module licence and the clean-room statement is consistent with the code. One blocker plus notes:
- BLOCKER parser.ts:34-60 (or/and/not/primary recursion) has no depth limit. `'('.repeat(5000)+'true'+')'.repeat(5000)` (and 20000 `not `/`!`) throws a raw `RangeError: Maximum call stack size exceeded` with no `offset`, not `ConditionParseError`; callers catching ConditionParseError for untrusted vendor profiles will crash. Fix: count depth in primary/not and throw ConditionParseError('Condition nested too deeply', offset) at e.g. 100-200; optionally cap source length.
- Same root cause for PRF-8: a long `a and a and ...` chain (100k parse fine, 1M in 1.5 s) builds a left-deep AST of that depth, so a recursive evaluator overflows too. A source/token cap fixes both.
- Linear time confirmed: 1M-char whitespace, strings, regex, lists, dotted names all linear; no quadratic path.
- ReDoS (evaluator's risk, flagged): `x =~ /(a+)+$/` parses fine; PRF-8 must bound subject length or use a safe engine.
- Minor: Logical/Not nodes use the operator offset while ast.ts says "offset it starts at" (compare/match/in use left.offset); `1e999` lexes to Infinity (accept or reject); `(a) == 1` is rejected (parenthesised operand), fine but undocumented.


Fix (prf7-fix): parser now caps source length (64 KiB, offset = cap) and nesting of '(' / 'not' (64) plus AST height (64, so chained and/or and nested nodes stay shallow for PRF-8's recursive evaluator); all throw ConditionParseError('Condition nested too deeply' / 'Condition longer than ...') with an offset. AST shape unchanged, evaluator untouched. ast.ts now documents offsets (compare/match/in start at the left operand, and/or/not at their keyword). Verified: lint/build/test pass (167) incl. new tests for 5000 '(', 20000 not/!, 1M chained and, 100 chained and. Trade-off: a single and/or chain is limited to 64 terms.
Files: src/domain/conditions/parse/{parser,ast}.ts, test/conditions-parse.test.ts.
Changelog: PRF-7: `parseCondition` rejects conditions over 64 KiB or nested/chained deeper than 64 with ConditionParseError.

Review passed (prf7-rereview): blocker gone. Probes in rr/q.mts: 63/64 ok, 65+ throws ConditionParseError with offset for nested parens, not, !, and/or chains, mixed and right-nested; 5000-100000 deep and >64 KiB input also ConditionParseError (no RangeError); 30000-item list ok. lint/build/test pass (175 + 1 expected fail, from other lanes). Chain limit: longest compatible_*_condition across .reference vendor ini (82k lines scanned) is 17 and/or terms (Snapmaker), so 64 is ample. Offsets documented in ast.ts. Notes: height is not counted for compare/match/in leaves (off by one, harmless); `(a) == 1` still rejected.
