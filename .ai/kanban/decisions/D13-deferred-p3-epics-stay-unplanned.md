---
id: D13
title: Deferred P3 epics get no cards until the owner reopens a row
status: accepted
date: 2026-10-25
cards: [38]
---

## Context

I10 holds six "Deferred P3 rows" epics: E49 (scripting and plugin API), E51 (toolpaths export),
E56 (model tools, extra formats, mesh export), E58 (SLA and milling settings, preset cloud sync),
E61 (firmware flashing, Prusa Wi-Fi and Connect, printer-side calibration, cloud fleet) and E67
(SLA, niche engine features, other output targets). Each epic's only acceptance criterion is
"an owner decision reopens a row". D6 already keeps SLA out.

## Decision (proposed)

**Recommended default:** these six epics get no stories or task cards, and M5 (SP36 to SP48 since the SP3 re-plan) is
planned without them. Reopening a row means adding it to this decision's list. Its epic then gets
stories and cards through the usual cycle, in whichever milestone the owner names.

## Alternatives

- **Plan them all now, at P3, at the end of M5.** That adds roughly 150 to 250 points (an
  estimate) for rows the feature matrix rates rare.
- **Drop the epics altogether.** That would lose the record of what was considered.

## What changes if the owner picks differently

The cards are written per epic as for the others, and `plan-sprints M5` (or a new milestone) is
re-run. Nothing planned so far depends on these epics.
