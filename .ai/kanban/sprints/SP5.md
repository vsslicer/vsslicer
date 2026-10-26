---
id: SP5
title: Preview 2
status: active
milestone: M1
start: "2026-10-26T01:06+00:00"
end: "2026-10-26T03:30+00:00"
capacity: 92
---

Planned by `board.py plan-sprints M1`: 91 points, 28 cards.

## Epics

- VSS:E5 Ship the vsslicer.gcode preview and simulation editor
- VSS:E6 Add the G-code language: grammar, hovers and completion
- VSS:E7 Expose the preview API and live print follow

## Plan at start (coordinator, 01:10)

Trimmed at start: GCP-34, 36, 39, 40, 41, 42, 48, 50, 51, 52, 53, 54, 55, 56 (43 points) moved to SP6;
each card's Progress says why (dependency-blocked, Q7, or the one-card-per-module lane and rule 5).

Workable: 60 points (bugs 20, preview 20, language 18, spike 2), plus the audit and retro cards.
One card per module at a time; every agent runs in the background and each lane gets its next card
or review as soon as its agent stops (rule 11).

| Lane (module) | Cards in order |
|---|---|
| gcode-planner | GCP-88, GCP-90 + GCP-91, GCP-92 + GCP-93, GCP-37 |
| gcode-api + gcode-parser | GCP-89 (api and parser part), GCP-95 (parser part) |
| gcode-bgcode | GCP-94 |
| webview-kit | PLT-189, PLT-190 + PLT-191 |
| gcode-preview | GCP-31, GCP-32 (with GCP-33 on its own files), GCP-35, GCP-38; GCP-89 and GCP-95 preview parts in `load-preview.ts` after gcode-api and gcode-parser are released |
| gcode-language (new module) | GCP-43, GCP-44, GCP-45, GCP-46 + GCP-47, data files only |
| research | GCP-49 |

Critical path: GCP-31, 32, 35, 38 at 14 points, about 69 minutes (rule 5: 72). Releases: each module
once, by the coordinator, after its last card passes review.
