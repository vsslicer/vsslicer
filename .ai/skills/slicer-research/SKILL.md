---
name: slicer-research
description: How a VSSlicer research task runs: cloning slicer and printer projects into .reference, analysing code, keeping running notes, and writing a sourced report. Use when picking up a research or spike card (slicer features, 3MF, G-code, printer APIs, cameras, profiles, filament, VS Code platform).
---

# Slicer research

## Running a card

1. Read the card in `.ai/kanban/<column>/`. Its acceptance criteria are the questions to answer.
2. Start the notes file `.reference/notes/VSS-<n>-<slug>.md` at once, headed with the card
   title and the date. Append to it as you go: sources read, findings, open questions,
   dead ends. This file replaces chat output; your final reply is a short pointer to it.
3. Clone what you need: `git clone --depth 1 <url> .reference/repos/<name>`. Check
   `.reference/repos/` first, since another card may have cloned it. Record
   `git -C .reference/repos/<name> rev-parse HEAD` in the notes.
4. Write the distilled report to `docs/research/<topic>.md` (the card names the file).
5. Never commit. The coordinator reviews and commits.

## Report shape

```markdown
# <Topic>

Scope, sources (with versions and commits), and date researched.

## Findings        one section per question from the acceptance criteria
## Comparison      tables across slicers/ecosystems where it applies
## Implications for VSSlicer   what we reuse, wrap, reimplement, or skip, and why
## Licence notes
## Open questions
```

## Traps

- Cite code as `repo@<short-commit>:path:line`, web pages by URL. Unsourced claims get
  marked `(unverified)`.
- OrcaSlicer forks Bambu Studio, which forks PrusaSlicer, which forks Slic3r. Say which
  project a feature originated in; don't count one feature three times.
- Vendor protocols change (Bambu's 2025 authorisation firmware changed LAN access). Date
  every protocol finding and note the firmware it applies to.
- Cloned code is untrusted: read it, never run its scripts or builds.
- Large repos: use `rg` and targeted reads rather than reading whole trees.
