# SP5 retro: Preview 2

Card VSS-79. Written by the retro agent, who wrote none of SP5's code. Sources: `board.py retro SP5`
(below, unedited), the start, stop, dispatch, move, create and update events in
`.ai/local/taskboard/activity.jsonl` from 2026-10-26T01:06, the cards' Progress in
`.ai/kanban/projects/{gcode,platform}/`, `.ai/kanban/sprints/SP5.md` ("Plan at start"), `board.py`'s
`close_sprint` and `_read_done_times`, and `git log 4ea462d..HEAD` (`79395e8` to `c336d68`). Facts the
coordinator supplied are marked "(coordinator)" and were checked against the events where the events
can show them.

## SP5 Preview 2: the facts

- Planned: 2026-10-26T01:06+00:00 to 2026-10-26T03:30+00:00, 124 points (51.7 points/hour)
- Actual: last card done 2026-10-26T02:09+00:00, 63 points (60.0 points/hour), -81 minutes after the planned end

| Card | Type | Effort | Points | Model | Started | Done | Minutes | Cost | Title |
|---|---|---|---|---|---|---|---|---|---|
| GCP-89 | bug | M | 3 | opus | 01:13 | 01:48 | 35 | $2.13 | Pass the file's ;FLAVOR: header to the planner choice in the preview |
| PLT-189 | bug | S | 2 | sonnet | 01:13 | 01:40 | 27 | $0.75 | Keep rebuilding and redraw when one context-restore rebuild throws |
| GCP-95 | bug | S | 2 | sonnet | 01:20 | 01:48 | 27 | $0.77 | Use gcode-parser's bgcodeSource in loadPreview and drop the gcode-bgcode dependency |
| GCP-92 | bug | XS | 1 | sonnet | 01:26 | 01:47 | 21 | $0.33 | Validate KlipperOptions.checkpointInterval |
| GCP-93 | bug | XS | 1 | sonnet | 01:26 | 01:47 | 21 | $0.72 | Keep G4 time in files with no moves |
| GCP-47 | docs | L | 5 | sonnet | 01:41 | 02:02 | 21 | $1.13 | Write the Klipper, RRF and Bambu catalogue entries |
| GCP-38 | feature | L | 5 | sonnet | 01:48 | 02:09 | 20 | $2.71 | Add the timeline, toolhead marker and extruded path |
| GCP-45 | feature | M | 3 | sonnet | 01:33 | 01:51 | 18 | $0.79 | Define the command catalogue schema, loader and lint |
| GCP-44 | feature | S | 2 | sonnet | 01:26 | 01:40 | 14 | $0.59 | Add the flavour setting and status-bar item |
| GCP-32 | feature | M | 3 | sonnet | 01:26 | 01:40 | 14 | $0.38 | Add colour modes with a palette texture |
| GCP-33 | feature | M | 3 | sonnet | 01:26 | 01:40 | 14 | $0.38 | Add orbit, pan, zoom and top/iso/front views |
| GCP-48 | feature | M | 3 | sonnet | 01:51 | 02:04 | 14 | $1.29 | Add hover and completion providers and the over-50-MB message |
| GCP-94 | bug | XS | 1 | sonnet | 01:13 | 01:25 | 13 | $0.33 | Return an exact ArrayBuffer from latin1ToBytes |
| GCP-88 | bug | S | 2 | sonnet | 01:13 | 01:25 | 13 | $0.58 | Free reported Klipper moves before the next G4 or M400 |
| GCP-43 | feature | M | 3 | sonnet | 01:13 | 01:26 | 13 | $0.88 | Write the gcode language contribution and TextMate grammar |
| GCP-31 | feature | M | 3 | opus | 01:13 | 01:26 | 13 | $2.03 | Port the instanced segment renderer to WebGL2 |
| GCP-49 | spike | S | 2 | opus | 01:13 | 01:26 | 13 | $2.43 | Spike: Bambu push_status and PrusaLink position fields |
| GCP-37 | feature | M | 3 | opus | 01:33 | 01:45 | 12 | $2.18 | Interpolate the toolhead position inside a move from the trapezoid |
| PLT-190 | bug | S | 2 | sonnet | 01:20 | 01:31 | 10 | $0.27 | Accept typed-array views in uploadMoveTextures |
| PLT-191 | bug | S | 2 | sonnet | 01:20 | 01:31 | 10 | $0.27 | Stop the segment renderer holding the CPU move buffer until dispose |
| GCP-90 | bug | S | 2 | sonnet | 01:20 | 01:31 | 10 | $0.30 | Clamp RRF M204 P0 and S0 so the RRF total is never NaN |
| GCP-91 | bug | S | 2 | sonnet | 01:20 | 01:31 | 10 | $0.30 | Honour M204 S after M204 P in the RRF planner |
| GCP-46 | docs | L | 5 | sonnet | 01:41 | 01:51 | 10 | $0.64 | Write the Marlin 2 and Prusa Buddy catalogue entries |
| GCP-35 | feature | M | 3 | sonnet | 01:41 | 01:48 | 7 | $0.77 | Add layer and move sliders, toggles and legend |
| VSS-44 | chore | S | 2 | opus | 02:13 | - | - | $0.39 | SP5: audit review and bugfix |
| VSS-79 | chore | S | 2 | opus | 02:13 | - | - | $0.30 | SP5: retro |
| PLT-7 | chore | S | 2 | sonnet | - | - | - | - | Claim the vsslicer namespace on open-vsx.org and the Microsoft publisher |
| PLT-16 | feature | M | 3 | sonnet | - | - | - | - | Run the integration matrix on three operating systems and VSCodium |
| PLT-18 | feature | S | 2 | sonnet | - | - | - | - | Run snapshot tests on Linux in CI and add a regenerate workflow |
| PLT-19 | chore | S | 2 | sonnet | - | - | - | - | Record meta-tests proving each harness turns CI red |
| PLT-24 | spike | L | 5 | opus | - | - | - | - | Spike: trusted publishing to Open VSX and the Microsoft marketplace |
| PLT-25 | feature | L | 5 | opus | - | - | - | - | Write the tag-driven release workflow |
| PLT-26 | feature | M | 3 | sonnet | - | - | - | - | Add idempotent per-marketplace publish steps with named failures |
| PLT-27 | chore | S | 2 | sonnet | - | - | - | - | Add the secret-leak scan over workflow logs |
| PLT-28 | chore | M | 3 | opus | - | - | - | - | Rehearse a full release of the pack and record the marketplace checks |
| PLT-29 | feature | S | 2 | sonnet | - | - | - | - | Test that installing the pack installs vsslicer.gcode |
| PLT-46 | feature | M | 3 | sonnet | - | - | - | - | Snapshot tests for colour modes, themes and ranges |
| PLT-181 | bug | S | 2 | sonnet | - | - | - | - | Reconcile the DCO requirement with the project commit convention |
| PLT-1 | chore | S | 2 | sonnet | - | - | - | $0.16 | Create the public GitHub repository and protect main |
| PLT-9 | feature | M | 3 | sonnet | 20:25 | - | - | $0.44 | Add the CI workflow: one job per changed module on three operating systems |
| PLT-10 | feature | S | 2 | sonnet | 21:21 | - | - | $0.28 | Enforce DCO sign-off in CI |
| PLT-33 | spike | S | 2 | opus | 23:22 | - | - | $1.69 | Spike: WebGPU probe and workers under the kit CSP |
| PLT-31 | spike | S | 2 | opus | 23:22 | - | - | $5.74 | Spike: postMessage transferables versus fetch(asWebviewUri) for 50 to 500 MB |
| GCP-21 | chore | M | 3 | sonnet | - | - | - | - | Run klipper_estimator as a black-box oracle in CI |
| GCP-25 | chore | M | 3 | sonnet | - | - | - | - | Compare against PrusaSlicer M73 totals and per-layer progress |
| GCP-29 | chore | S | 2 | sonnet | - | - | - | - | Measure three H2C prints against the estimates |
| GCP-79 | chore | S | 2 | sonnet | 00:09 | - | - | $0.69 | Extend the golden corpus to PrusaSlicer, SuperSlicer, Cura and Bambu multi-material |
| GCP-18 | feature | S | 2 | sonnet | 00:14 | - | - | $0.87 | Benchmark memory and throughput on synthetic 50, 200 and 500 MB files in CI |

By effort:

| Effort | Cards | Done | Median minutes | Minutes per point | Cost |
|---|---|---|---|---|---|
| L | 5 | 3 | 20 | 3.4 | $4.48 |
| M | 16 | 9 | 14 | 5.2 | $11.27 |
| S | 24 | 9 | 13 | 7.4 | $16.39 |
| XS | 3 | 3 | 21 | 18.3 | $1.38 |

By model:

| Model | Cards | Done | Median minutes | Minutes per point | Cost |
|---|---|---|---|---|---|
| opus | 11 | 4 | 13 | 6.6 | $16.89 |
| sonnet | 37 | 20 | 14 | 5.9 | $16.62 |

By type:

| Type | Cards | Done | Median minutes | Minutes per point | Cost |
|---|---|---|---|---|---|
| bug | 12 | 11 | 13 | 9.8 | $6.74 |
| chore | 11 | 0 | - | - | $1.55 |
| docs | 2 | 2 | 21 | 3.1 | $1.77 |
| feature | 19 | 10 | 14 | 4.5 | $13.60 |
| spike | 4 | 1 | 13 | 6.5 | $9.86 |

## Reading the facts table

This time the table measures something. **Started** is the coordinator's move to doing at dispatch,
and **Done** is the git commit that brought the card into `done/` (`_read_done_times`); cards were
committed as their reviews passed, 18 of 24 within 5 minutes of the reviewer's move to done (rule 20).
The six later ones: GCP-92 11.8 minutes (held for GCP-93's fix, one commit for both), GCP-47 9.9,
GCP-44 6.0, PLT-189 5.4, GCP-32 and GCP-33 5.1. So Minutes is doing to commit, about 2 minutes more
than doing to the reviewer's done move, whose median is **10.3 minutes** (SP4 wave 1: 45 to 47). The
longest, from the move events: GCP-89 34.2 (three parts in three modules, see Why), GCP-95 22.7 (two
parts around a release), PLT-189 22.1, GCP-93 20.8 and GCP-38 19.9 (fix rounds), GCP-45 16.4 (fix
round). XS reads 18.3 minutes a point because GCP-92 and GCP-93 waited for GCP-93's fix in one commit.

### Points: what close-sprint will record

`close_sprint` sums the points of every card on every board whose `sprint` is `VSS:SP5` at close time
(`sprint_scope`), done or not, and counts a card as finished when `_read_done_times` finds it in
`done/` (an uncommitted arrival counts as now). It does not look at when a card joined the sprint. So:

| | Points |
|---|---|
| Done cards in the facts table (24 cards, including GCP-48, pulled back from SP6 at 01:51:00) | 63 |
| VSS-44 (audit review and bugfix) and VSS-79 (this retro), done before close | 4 |
| **Completed, as close-sprint will record it** | **67** |
| Committed, as close-sprint will record it (facts table, if no SP5 card is re-sized before close) | 124 |
| GCP-96 and GCP-97 (created in SP5, `sprint: VSS:SP6`) | not counted |

The difference between 67 and the 63 delivered is the audit and retro cards, and nothing else. **That
was SP4's difference too:** its close recorded 76 of 133 and 25 of 47 cards, and the retro's 72
already counted GCP-87 and PLT-188 (both are in SP4's facts table). 76 - 72 = VSS-43 + VSS-78. And
SP4's committed fell from the retro's 139 to 133 because the retro re-sized four carried cards
(PLT-31 -3, PLT-33, GCP-18 and GCP-79 -1 each) before the close. This retro re-sizes no SP5 card, so
SP5 closes at **67 of 124**. Velocity below uses the 63 delivered points over the time to the last card,
because the audit and retro run after it.

### Agents, from the start and stop events

51 agents from 01:06:54 (SP4 closed, SP5 began) to 02:12:02 (the release commit after the clean-registry
ci): the coordinator's own session (`a3a295`), the SP4 audit and the SP5 audit and retro agents excluded.
Agents that started within 30 seconds of each other are one dispatch message:

| Wave start | Agents | Median run (min) | Longest (min) | Last stop | Gap to next wave | Finished agents waited (agent-min) |
|---|---|---|---|---|---|---|
| 01:14:09 | 7 | 3.4 | GCP-49 spike (Opus) 6.3 | 01:20:39 | 1.5 | 22.2 |
| 01:22:07 | 10 | 1.2 | GCP-49 review (Opus) 2.7 | 01:25:01 | 2.5 | 12.9 |
| 01:27:28 | 7 | 1.1 | PLT-190+191 review 3.0 | 01:30:39 | 3.7 | 11.8 |
| 01:34:22 | 7 | 1.1 | GCP-37 (Opus) 5.4 | 01:39:52 | 2.4 | 25.4 |
| 01:42:13 | 7 | 2.1 | GCP-35 2.9 | 01:45:15 | 0.9 | 8.1 |
| 01:46:07 | 3 | 1.0 | GCP-93 re-review + GCP-89 part C review 1.2 | 01:47:25 | 2.0 | 0.6 |
| 01:49:25 | 3 | 0.5 | GCP-47 rework 1.2 | 01:50:43 | 0.9 | 1.5 |
| 01:51:37 | 3 | 5.3 | GCP-38 (Sonnet L) 10.4 | 02:02:01 | 0.9 | 14.5 |
| 02:02:58 | 2 | 1.3 | GCP-38 review (Opus) 1.7 | 02:04:39 | 0.8 | 0.6 |
| 02:05:25 | 1 | 1.4 | GCP-38 fix | 02:06:51 | 0.4 | 0 |
| 02:07:13 | 1 | 1.8 | GCP-38 re-review (Opus) | 02:08:59 | 3.0 (to the release commit) | 0 |

From 01:06:54 to 02:12:02 (65.1 minutes): **100.2 agent-minutes**, mean **1.54 running agents** (SP4
2.34, SP3 2.0), peak 10. Agent time per done point: **1.6** (SP4 3.2, SP3 1.5). Opus workers 20.6
minutes for 11 points (GCP-31, GCP-37, GCP-49, GCP-89's first part: 1.9 a point, SP4 2.6), Opus reviews
10.8 (five, two of them GCP-38's, a Sonnet card); Sonnet workers 48.2 minutes for 52 points (0.9 a
point), Sonnet reviews 20.5.

**No agent ran for 26.1 minutes (40%; SP4 21%, SP3 37%):** 7.2 at the start (01:06:54 to 01:14:09: the
trim of 14 cards to SP6 and the lane plan, `79395e8` at 01:12:26), 3.0 at the end (release and the
clean-registry ci), and **15.9 in ten gaps between waves** (0.4 to 3.7, median 1.2). Without the start
and the end: 15.9 of 54.9 minutes, 29%.

**Every commit falls in one of those gaps.** The 25 commits from `0ef82ec` (01:25:55) to `5bd0049`
(02:09:15) all land between a wave's last stop and the next wave's first start (for example the three
releases: 01:32:50 in the 01:30:39 to 01:34:22 gap, 01:41:04 in 01:39:52 to 01:42:13, 01:48:38 in
01:47:25 to 01:49:25). The coordinator did no work while a wave ran: it was blocked on the wave's
results like the waiting agents. So the gaps are the coordinator's serial work (verify, commit,
release, move cards, write the next prompts), and they cannot overlap agent work as long as the
coordinator sends commits and Agent calls in separate messages.

**Finished agents' results waited for their wave's last agent for 97.7 agent-minutes** (SP4 594, 301 of
them in wave 1). As wall time for a lane: the median agent of each wave stopped 0 to 5.1 minutes before
its wave's last, 17.6 minutes summed over the 11 waves. **A worker's stop to its review's start: median
4.6 minutes**, longest 11.3 (GCP-89's part A review to its preview part, which waited for the gcode-api
and gcode-parser release); SP4: 43 for wave 1. Rule 17's test (under 10) passes.

## On time or not

**Early, and out of work again.** The last card was done at 02:09:15 (`5bd0049`) and the release after
the clean-registry ci was committed at 02:12:02 (`90ec776`), **78 minutes before the planned end of
03:30**.

| | Points |
|---|---|
| Assigned (facts table) | 124 |
| Owner-blocked carried cards: PLT-1, 7, 9, 10, 16, 18, 19, 24 to 29, 31, 33, 46, 181, GCP-18, 21, 25, 29, 79 (Q7, Q8, Q12, Q14 to Q16, hardware, exports) | 57 |
| Audit and retro cards | 4 |
| Workable at the start (coordinator's plan, after trimming 43 points to SP6) | 60 |
| Pulled back in during the sprint: GCP-48 (01:51:00; the card's Progress says 01:53) | 3 |
| Done | **63** (100% of workable; 67 at close with the audit and retro) |
| Sprint capacity (SP5 doc) | 92 |

**Velocity: 63 points in 63 minutes (01:06 to 02:09), 60.0 points an hour** (57.3 to the release
commit; SP4 46.5). It is again a floor: every workable card was done and the sprint stopped for lack of
work, with 81 minutes left. Rule 10's formula, 65 minutes x 1.54 agents / 1.5, gives 67 points: close to
the 63 measured, because SP5 had no long spike and SP4's 3.2 agent-minutes a point fell back to 1.6.

By effort, model and type (agent time, worker plus fix, from the events):

- **XS** (GCP-92, 93, 94): 0.6 to 1.1 minutes; GCP-93's fix 1.2 (shared with GCP-89's part C).
- **S**: bug fixes 0.8 to 2.6 (GCP-88 0.8, PLT-189 2.6 plus a 0.5 fix, GCP-90+91 1.7 for two, PLT-190+191
  1.2 for two, GCP-95's parser part 2.0); GCP-44 1.7; the **GCP-49 spike (Opus) 6.3**, the longest S.
- **M**: Sonnet 1 to 3.4 (GCP-45 1.0 plus a 1.0 fix, GCP-32+33 2.1 for two, GCP-35 2.9, GCP-43 3.4,
  which created the gcode-language module), **GCP-48 5.3**; Opus 4.2 to 5.4 (GCP-89 4.2 plus 1.9 and 1.2
  in later parts, GCP-31 4.7, GCP-37 5.4).
- **L**: GCP-46 and GCP-47 (catalogue data, Sonnet) 2.1 each, GCP-47 plus a 1.2 rework; **GCP-38 10.4**
  plus a 1.4 fix, the sprint's longest agent and the only one over 7 minutes.
- **By model**: Opus $16.89 on 11 cards (4 done, 11 points, plus the audit and retro and carried spikes);
  Sonnet $16.62 on 37 (20 done, 52 points). Opus is about two agent-minutes a point, Sonnet one.
- **By type**: bugs 11 of 12 done (PLT-181 is owner-blocked), 2 failed review (PLT-189, GCP-93); new
  code (features, docs, the spike) 13 done, 2 failed review (GCP-45, GCP-38) and 1 was reworked after
  another card's change (GCP-47). Chores: 0 of 11, all owner-blocked carry-overs.

No card ran far over its size in agent time; the ones that ran long in wall time did so for the reasons
below.

## Why

- *The barrier is still there, and the mitigation worked* (coordinator; consistent with the events).
  Every Agent call went out with `run_in_background: true`, and still each message's agents came back
  together when the last stopped: no wave started before the previous wave's last stop, and the
  coordinator committed nothing while a wave ran. True per-lane dispatch (rule 11) was not achieved.
  The coordinator's mitigations: no Opus spike mixed with short cards except where it could not be
  avoided (wave 1 had the GCP-49 spike, 6.3 minutes, with 0.6-minute bug fixes; wave 4 GCP-37, 5.4),
  two cards in sequence per lane agent (GCP-90+91, PLT-190+191, GCP-92+93, GCP-32+33), and each card's
  review dispatched in the next message. **That fixed SP4's barrier cost.** SP4's wave 1 held seven
  short cards 39 to 44 minutes behind GCP-30 and PLT-31; SP5's longest wave was 10.4 minutes (GCP-38,
  with GCP-48 and GCP-47's review), the waits fell from 594 to 98 agent-minutes, a worker's stop to its
  review from 43 to 4.6 minutes (median), and doing to done from 45 to 10.3 (median). The cost left is
  about 18 minutes of lane time over 11 waves plus the coordinator's 16 minutes between waves.
- *Out of lanes, not out of points.* SP5 had seven lanes at the start and only one with work after
  01:52: gcode-preview, which carried GCP-31, GCP-32+33, GCP-35, GCP-38 and the preview parts of GCP-89
  and GCP-95 from 01:13 to 02:09 (about 18 points an hour). gcode-bgcode was done at 01:22, gcode-api and
  gcode-parser at 01:32 (release), webview-kit at 01:41 (release), gcode-planner at 01:47, the research
  lane at 01:24, gcode-language at 02:04. The SP6 cards that were workable by then were not pulled in:
  GCP-40 (failure UI) and GCP-50 (the exports, once GCP-49 was done at 01:24) in gcode-preview, which
  rule 14 could have run beside GCP-38 on its own files, and GCP-97 (created 02:02) after GCP-38. Only
  GCP-48 came back (01:51:00), when the gcode-language lane ran ahead. The trim at the start used rule
  5's 72 minutes for the gcode-preview chain (estimated 69); the chain took 56. Mean running agents
  1.54, the lowest since SP2.
- *Coordinator time between waves* (events and git). 15.9 minutes in ten gaps, plus 7.2 at the start
  for the trim and lane plan and 3.0 at the end. Under the barrier the coordinator's commits and
  releases cannot overlap a wave, so rule 11's 15% idle target cannot be met by dispatching faster; it
  needs less coordinator work per gap or that work sent in the same message as the next wave's agents
  (not tried in SP5; whether the harness runs a Bash call alongside background Agent calls is unverified).
- *Cards split across modules ran in parts* (coordinator; the commits confirm it). GCP-89 (M, Opus):
  gcode-api and gcode-parser part (`d83d16f`), release (`0a8d353`), preview part (`75445cd`), and a part
  C in gcode-planner that the card did not name: Cura writes `;FLAVOR:RepRap` for RepRapFirmware, so
  `flavourFromName` had to map Cura's names (its Progress, CuraEngine@47b0388). Doing to done 34.2
  minutes for 7.3 agent-minutes. GCP-95 (S): parser part (`99796a2`), release, preview part, 22.7
  minutes. Rule 13 says a card that changes a shared module and its consumers is at least L or split;
  these were neither, and the parts waited on releases and other lanes' reviews.
- *Fix rounds* (coordinator; confirmed by the move events):

  | Card | Failed review | Done | Wall | Fix agent | Finding |
  |---|---|---|---|---|---|
  | PLT-189 | 01:22:47 | 01:35:05 | 12.3 | 0.5 | a throwing rebuild left the lost context's `free`; now cleared in the catch, tested |
  | GCP-93 | 01:35:56 | 01:47:15 | 11.3 | 1.2 (with GCP-89 part C) | G4 lookup per move too slow at 300k moves and 20k markers; a map built once |
  | GCP-45 | 01:42:38 | 01:49:47 | 7.2 | 1.0 | sources, codes and a test, plus what GCP-46 and GCP-47 reported about the validator |
  | GCP-47 | 01:48:53 (coordinator) | 01:52:31 | 3.6 | 1.2 | reworked after GCP-45's validator change (extended commands, sources) |
  | GCP-38 | 02:04:27 | 02:08:46 | 4.3 | 1.4 | `done()` patched layer and move from the clock and overwrote the saved view |

  5 rounds in 24 done cards (1 in 4.8): bugs 2 of 11, against rule 12's 1 in 9; new code 3 of 13,
  against rule 19's 1 in 6. Each cost 3.6 to 12.3 minutes of wall time (median 7.2; rule 19 budgets 15)
  for 0.5 to 1.4 agent-minutes. GCP-47's rework came from running the catalogue data cards (GCP-46, 47,
  dispatched 01:41:10) while their schema card GCP-45 was in review; GCP-45 failed at 01:42:38 and its
  validator changed.
- *Combined commits* (coordinator; the log confirms them). Where two cards changed the same hunks the
  coordinator gave them to one lane agent in sequence and committed them together, with both tickets in
  the subject: GCP-90+91 (`1e2b6f6`, rrf-planner.ts), PLT-190+191 (`2ea965e`), GCP-32+33 (`5793f83`,
  main.ts and preview-renderer.ts), GCP-92+93 (`a9eddb4`, klipper.ts), GCP-89+95 preview parts
  (`75445cd`, load-preview.ts). Two "also carries" notes remain (`5793f83` carries GCP-95's
  renderer.test.ts line, `103900c` GCP-89's and GCP-95's CHANGELOG lines): far fewer than SP4's split of
  22 commits by file.
- *One card per module at a time* (coordinator; confirmed by the dispatch descriptions). Every overlap
  in a module was a review of one card while the next card in that module ran (gcode-planner,
  gcode-parser, webview-kit, gcode-preview, gcode-language), or GCP-46 and GCP-47 on separate data files
  in gcode-language (rule 14).
- *Releases* (coordinator; the log confirms the versions). One version per module (rule 21 held):
  gcode-bgcode 0.4.3, gcode-api 0.6.0 and gcode-parser 0.11.0 (`0a8d353`), webview-kit 0.5.1
  (`31df13f`), gcode-planner 0.4.0 (`08e96f1`), gcode-preview 0.3.0 and gcode-language 0.1.0
  (`90ec776`). The clean-registry ci exited 0 on the third try: first gcode-language, created by GCP-43,
  had no `prepack` build; then the version check wanted the change committed. About 3 minutes at the end.
- *Stray files* (coordinator; not in the events). Reviewers wrote review lines to a literal
  `review/088-*.md` (an unmatched glob) and to a stale `review/189-*.md` after moving the card to done;
  the coordinator merged both into the cards and deleted them. A reviewer put a probe
  `test/zz-diff.test.ts` in gcode-planner's test folder and a GCP-31 reviewer one in gcode-preview's;
  both removed them. Four incidents in 51 agents (SP4: four in 55); rule 22's target was zero. All four
  are agents writing outside their scratch directory to a path they built themselves.
- *Work created or moved in the sprint* (coordinator; the create and update events confirm it). 14
  cards (43 points) trimmed to SP6 at 01:12, each with its reason in Progress; GCP-32 re-scoped to the
  four colour modes webview-kit 0.5's shader can draw, with GCP-96 created (01:33:01) for width, flow,
  fan and temperature; GCP-97 created (02:02:23) from GCP-38's scope call (the marker uses constant
  speed between move starts, not Klipper's trapezoids); GCP-48 back from SP6 (01:51:00). Owner question
  Q17 (GCP-49, 01:20:08: a mid-print H2C capture, not blocking) and proposed decision D20.

## Change

In `.ai/plans/estimation.md`: rules 11, 17, 19, 20, 21 and 22 amended, rules 23 and 24 added, each with
its evidence, and "Current calibration" updated.

- **Rule 11 amended:** per-lane dispatch is not available while a message's Agent calls return
  together and the coordinator is blocked until they do. Keep the gap between a wave's last stop and the
  next wave's start under 2 minutes, prepare the next wave's prompts and the sprint's trim before they
  are needed (the trim at the previous close), and try sending each gap's commits in the same message as
  the next wave's Agent calls. Testable: idle time excluding the first dispatch and the final release
  under 15% (SP5 29%, ten gaps of median 1.2 minutes).
- **Rule 17 amended:** confirmed by SP5 (median stop to review 4.6 minutes, SP4 43; waits 98
  agent-minutes, SP4 594). A wave's longest agent sets the wave: keep agents over 5 minutes (Opus
  spikes and contract cards, Sonnet L in the preview) together, or with lanes whose next card is also
  long.
- **Rule 19 amended:** budget one fix round per 5 reviewed cards of any kind, about 8 minutes of wall
  each (SP5 5 in 24, median 7.2 minutes); cards that consume a schema, validator or contract start after
  that card passes review (GCP-47).
- **Rule 20 amended:** two cards that change the same hunks go to one lane agent in sequence and one
  commit with both tickets in the subject; the rest is unchanged (SP5 18 of 24 within 5 minutes).
- **Rule 21 amended:** a card that creates a module copies the `prepack` script from an existing
  module, and the coordinator commits each release before the clean-registry ci. Testable: the ci passes
  on its first run (SP5: third).
- **Rule 22 amended:** reviewers write the review into the card before moving it, at the one path
  `command ls -1 <board>/*/<n>-*.md` prints (stop if it prints none or two), and probes live only in the
  scratch directory, importing the module by absolute path. Testable: zero stray files (SP5 four).
- **Rule 23 added: capacity is the busiest lane.** A sprint lasts as long as its longest single-module
  chain; plan its points per lane at about 20 an hour (SP5: gcode-preview 18, gcode-language 25), give
  the hot module a second card on disjoint files (rule 14) where one exists, and keep an ordered pull-in
  list of next-sprint cards that are not owner- or dependency-blocked, pulled in as each lane frees.
  Testable: no sprint ends more than 15 minutes early while a workable card sits in the next sprint
  (SP5: 81 minutes early, GCP-40, GCP-50, GCP-97 workable).
- **Rule 24 added: report delivered and closed points.** close-sprint counts every card with the
  sprint's id at close, including the audit and retro cards and cards pulled in, and the committed
  figure changes with any re-sizing of carried cards before the close. Retros report both and calibrate
  on delivered points to the last card. Testable: the retro's close figure equals the sprint doc's
  `completed` (SP5: 67).

## Re-sizing

With `board.py --board .ai/kanban/projects/gcode --agent sp5-retro set`, owner-facing scope unchanged:

- **GCP-96** (Add width, flow, fan and temperature colour modes, SP6) M to **L** (rule 13): its
  criteria change webview-kit's shader and release it, carry fan and temperature from gcode-parser, and
  wire the modes in gcode-preview, three modules, like GCP-89 (M), which ran 34 minutes in three parts.
  The fan and temperature part also waits on D17 (rule 6); the SP6 planner may split it per module
  instead.

No other card in SP6 or later breaks a rule by its size. For the SP6 coordinator (not changed here):

- **The `3mf` lane is the critical path.** SP6 holds VWR-1 to VWR-34, 73 and 74 (about 87 points),
  nearly all in one module and mostly one chain (VWR-2, 3, 5, 6, 7, then 15, 16, 17, 20, 21, 22, 23,
  29, 33, 74): far over rule 5's 72 minutes and rule 23's 40 points a lane. Run the dialect readers
  (VWR-21 to 28, separate files) two at a time (rule 14), and the fixture cards (VWR-10 to 12) as their
  own lane; VWR-10 to 12 need owner GUI exports where the CLIs cannot export (rule 6).
- **Still dependency-blocked in SP6 (rule 7):** GCP-36, 39, 52, 53, 55, 56 (25 points) wait on GCP-16,
  which is in SP7 behind VWR-73; GCP-41 and 42 wait on GCP-18 (Q7); VWR-18 and 19 on PLT-9 (Q7).
- **Workable M1 carry-overs for other lanes:** GCP-40, 50, 51, 54, 96, 97 and GCP-34's local part
  (gcode-preview, gcode-planner), the first pull-in list under rule 23.

## Re-plan: plan-sprints dry runs

`board.py plan-sprints M1` and `M2` with no options plan into one-week sprints after the last planned
one (SP51, 2026-10-29); the useful runs give the length and start: `--length 2h --start
2026-10-26T03:30` (dry runs, nothing applied). The board reads 48 points an hour, measured over closed
sprints.

| Run | Points | Sprints of 2 hours | Ends |
|---|---|---|---|
| M1 | 52 (17 cards: GCP-15, 16, 34, 36, 39 to 42, 50 to 56, 96, 97) | 1 | 05:30 |
| M2 at 96 a sprint (board default) | 613 (234 cards) | 7 (last 39) | 17:30 |
| M2 at 92 (SP5's capacity) | 613 | 7 (last 62) | 17:30 |
| M2 at 120 (SP5's 60 an hour) | 613 | 6 (last 16) | 15:30 |

- **Every remaining M1 card lands outside M1**, whose due date is 03:30 when SP5 was planned to end: all
  52 points fall in the 03:30 to 05:30 sprint. That cannot be fixed by planning; the owner can move M1's
  due date to SP6's end (proposed, not changed: milestone dates are owner-facing).
- **M2 fits only just.** M2 alone fills 03:30 to 17:30, its due date, at 92 or 96 a sprint. With M1's
  52 points in the same sprints the total is 665 against 644 at 92 (21 points past 17:30) or 672 at 96 (7
  to spare). At SP5's measured 60 an hour (120 a sprint) it fits a sprint early, and SP6 can start at
  SP5's close (about 02:20) instead of 03:30, which adds about 70 minutes.
- **Recommendation: do not apply.** The velocity change (46.5 to 60 an hour) is not what limits SP6;
  the `3mf` lane is (rule 23), and an applied plan-sprints creates new sprint documents from SP51 rather
  than refilling SP6 to SP12. The SP6 coordinator should trim at start by lanes, as SP5 did, keep the
  GCP pull-in list above, and re-run the M2 dry run after SP6 closes, when the board's measured figure
  includes SP5 and SP6.
