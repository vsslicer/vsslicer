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
depends_on: [2]
created: 2026-10-25
---

Parses the shared `when` expression language into an AST: literals, comparisons, `=~ /re/`, `!~`, `in [..]`, `and`/`or`/`not` and parentheses over `printer.* nozzle.* surface.* feeder.* material.* process.*`.

**Code:** `vsslicer/modules/profile-api/src/domain/conditions/parse/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [ ] Grammar tests for every operator and namespace in the epic; precedence `not` > `and` > `or`
- [ ] A parse error carries offset and a message; no function calls or assignments parse (negative tests)
- [ ] No `eval`, `Function` or dynamic import in the module (a lint rule or test greps for them)

## Tasks

- [ ] Write the lexer
- [ ] Write the parser and AST types
- [ ] Write the grammar tests

## Progress

Not started.
