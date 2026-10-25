---
id: US46
title: "Validate imported templates from other modules"
status: reviewed
epic: VSS:E50
---

As a profile or slicer module, I want a pure function that returns the diagnostics for a template, so that imported profiles and slicer pass-through can be checked without VS Code.

## Acceptance criteria

- [ ] `validateTemplate(text, slicer, kind, options)` is exported from `@vsslicer/gcode-templates`, runs in plain Node, and its output equals what the editor shows
- [ ] The public API is versioned and checked by the api-extractor report

## Out of scope

- Calling it from the profile or slicer modules (their boards).
