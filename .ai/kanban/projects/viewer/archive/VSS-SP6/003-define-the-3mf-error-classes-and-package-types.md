---
id: 3
title: Define the 3MF error classes and Package types
type: feature
priority: P0
effort: S
model: sonnet
area: [3mf]
story: US1
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [2]
created: 2026-10-25
---

The typed vocabulary every later card uses: `Package`, `Part`, and one typed error class with a user-facing message for each failure.

**Code:** `vsslicer/modules/3mf/src/domain/` (module: `3mf`, layer: `domain`)

## Acceptance criteria

- [x] Errors exist for corrupt zip, missing root model, malformed XML, unsupported required extension, size above cap, Production path to a missing part; each has a code and a user message
- [x] `Part` carries name, content type, relationships and raw bytes
- [x] Pure types and functions with no I/O (test imports nothing from adapters)

## Tasks

- [x] Write error classes
- [x] Write Package and Part types
- [x] Unit-test messages

## Progress

Done. `src/domain/errors.ts`: abstract `ThreeMfError` (`code`, `userMessage`, `cause` kept) and `CorruptZipError`, `MissingRootModelError`, `MalformedXmlError(part, detail)`, `UnsupportedRequiredExtensionError(extension)`, `SizeCapExceededError(what, limitBytes)`, `MissingProductionPartError(path)`. `src/domain/package.ts`: `Package { rootModel, parts }`, `Part { name, contentType, relationships, bytes }`, `Relationship`. Exported from `src/index.ts`.
Verified: `test/errors.test.ts` (codes, messages, instanceof, cause, Part shape) passes with lint, build and test green; the domain imports nothing but TypeScript.
Not done: no behaviour yet, only the vocabulary.
Changelog: VWR-3 line is already in the module's Unreleased.

Review passed (vwr23-reviewer): six error classes with code and userMessage, cause kept, Part has name/contentType/relationships/bytes; domain is pure (no imports); test passes under lint/build/test; classes match the failure modes in docs/research/3mf.md (production path, required extensions, zip, XML).
