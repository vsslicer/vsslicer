# SP6 retro: Open 1

Card VSS-80. Written by the retro agent, who wrote none of SP6's code. Sources: `board.py retro SP6`
(below, unedited), the start, stop, dispatch, move, create, update and ask events in
`.ai/local/taskboard/activity.jsonl` from 2026-10-26T02:27, the cards' Progress in
`.ai/kanban/projects/{gcode,viewer,profiles,platform}/`, `.ai/kanban/sprints/SP6.md`, and
`git log 470d05f..HEAD` (`190cd59` to `b1e523f`, 52 commits). Facts the coordinator supplied are marked
"(coordinator)" and were checked against the events where the events can show them. The audit (VSS-45)
ran in parallel; its findings are not in this retro.

## SP6 Open 1: the facts

- Planned: 2026-10-26T02:27+00:00 to 2026-10-26T05:30+00:00, 223 points (73.1 points/hour)
- Actual: last card done 2026-10-26T04:34+00:00, 155 points (73.2 points/hour), -56 minutes after the planned end

| Card | Type | Effort | Points | Model | Started | Done | Minutes | Cost | Title |
|---|---|---|---|---|---|---|---|---|---|
| PRF-8 | feature | M | 3 | sonnet | 02:53 | 03:59 | 66 | $4.71 | Evaluate conditions over a context with Prusa's failure semantics and a fuzz test |
| VWR-16 | feature | M | 3 | sonnet | 03:22 | 04:05 | 43 | $1.59 | Read components, build items, transforms and materials |
| PRF-7 | feature | M | 3 | opus | 02:47 | 03:30 | 43 | $1.66 | Write the condition lexer and recursive-descent parser |
| PRF-14 | feature | L | 5 | opus | 03:43 | 04:26 | 43 | $4.33 | Generate catalogue entries from the Orca key list |
| PRF-12 | feature | M | 3 | opus | 02:53 | 03:35 | 42 | $3.71 | Define the catalogue entry type, the group list and per-setting override scope |
| GCP-99 | bug | M | 3 | sonnet | 02:31 | 03:12 | 41 | $1.09 | Map flavour names once, in gcode-api, for the parser, planner and language features |
| VWR-5 | feature | M | 3 | sonnet | 02:51 | 03:30 | 39 | $0.68 | Read zip entries with a size cap |
| VWR-6 | feature | M | 3 | sonnet | 02:51 | 03:30 | 39 | $0.68 | Read content types and relationships |
| GCP-40 | feature | M | 3 | sonnet | 02:47 | 03:21 | 34 | $1.21 | Add the failure UI: no WebGL2, context lost, worker crash |
| VWR-47 | feature | S | 2 | sonnet | 03:43 | 04:16 | 34 | $0.48 | Add parseModel with the triangle cap |
| GCP-105 | bug | XS | 1 | sonnet | 02:42 | 03:12 | 30 | $0.29 | Drop the NamedChunk shortcut now that gcode-api ^0.6.0 has flavourName |
| VWR-15 | feature | M | 3 | sonnet | 03:12 | 03:42 | 30 | $1.21 | Read core objects, meshes and metadata |
| VWR-8 | feature | M | 3 | opus | 03:12 | 03:42 | 30 | $2.02 | Write a zip by copying original entries raw |
| VWR-48 | feature | M | 3 | sonnet | 03:46 | 04:16 | 30 | $0.68 | Run mesh parsing in worker_threads for the extension host |
| VWR-7 | feature | M | 3 | sonnet | 02:53 | 03:21 | 28 | $0.65 | Implement openPackage and Package.parts |
| VWR-36 | chore | S | 2 | sonnet | 03:15 | 03:42 | 28 | $0.57 | Generate 1, 5 and 20 million triangle STLs in CI |
| PLT-192 | feature | S | 2 | sonnet | 02:53 | 03:21 | 27 | $0.80 | Add Width and Flow colour modes to the segment shader |
| GCP-104 | bug | XS | 1 | sonnet | 02:53 | 03:20 | 27 | $0.26 | Catch flavour typos, leading-zero codes and cross-file duplicates in the catalogue lint |
| GCP-97 | feature | M | 3 | sonnet | 02:53 | 03:21 | 27 | $1.35 | Drive the timeline marker from ToolheadWindow trapezoids and dwells |
| VWR-46 | feature | M | 3 | opus | 02:53 | 03:20 | 27 | $1.07 | Build and serialise a BVH with three-mesh-bvh |
| VWR-14 | feature | S | 2 | sonnet | 02:47 | 03:12 | 25 | $0.43 | Define Project, Model and mesh types |
| VWR-42 | feature | M | 3 | sonnet | 02:47 | 03:12 | 25 | $0.27 | Deduplicate vertices into indexed geometry |
| VWR-4 | chore | S | 2 | sonnet | 02:47 | 03:12 | 25 | $0.39 | Build broken-package fixtures for each error class |
| PRF-3 | feature | M | 3 | sonnet | 02:47 | 03:12 | 25 | $0.41 | Publish the JSON Schema (draft 2020-12) for every entity with positive and negative fixtures |
| GCP-106 | bug | XS | 1 | sonnet | 02:56 | 03:20 | 24 | $0.26 | Describe what gcode-language ships in its README and PROVENANCE |
| GCP-103 | bug | S | 2 | sonnet | 02:56 | 03:20 | 24 | $0.26 | Rescan only the edited lines for unknown-command warnings |
| GCP-109 | chore | S | 2 | sonnet | 03:35 | 03:59 | 24 | $0.48 | Use ToolheadWindow's transfer form and the planner-free entry in the preview |
| PRF-13 | feature | S | 2 | sonnet | 03:35 | 03:59 | 24 | $0.48 | Implement the conversion kinds both ways |
| GCP-34 | chore | M | 3 | sonnet | 03:43 | 04:05 | 23 | $0.66 | Set up Playwright snapshots on Chromium with SwiftShader |
| VWR-43 | feature | S | 2 | sonnet | 02:49 | 03:12 | 23 | $0.27 | Compute volume, bounding box and degenerate triangles |
| VWR-17 | feature | M | 3 | opus | 03:43 | 04:05 | 23 | $0.84 | Resolve Production sub-models and required extensions |
| VWR-37 | spike | M | 3 | opus | 03:43 | 04:05 | 23 | $1.42 | Spike: parse, dedup and BVH time and memory at 1, 5 and 20 M |
| PRF-6 | feature | M | 3 | sonnet | 02:50 | 03:12 | 22 | $0.41 | Implement merge(chain) and chain resolution with typed errors |
| PRF-5 | feature | S | 2 | sonnet | 03:12 | 03:35 | 22 | $0.63 | Prove per-nozzle printer presets and material fields are expressible |
| VWR-9 | feature | M | 3 | sonnet | 03:22 | 03:42 | 21 | $0.83 | Implement Package.save, replacePart, addPart and removePart |
| VWR-44 | feature | M | 3 | sonnet | 03:12 | 03:30 | 18 | $0.27 | Count open and non-manifold edges |
| GCP-16 | feature | M | 3 | sonnet | 04:11 | 04:28 | 17 | $1.78 | Open .gcode.3mf plates with statistics, thumbnails and MD5 check |
| PRF-4 | feature | S | 2 | sonnet | 03:17 | 03:35 | 17 | $1.01 | Add multi-tool, IDEX and H2C dual-extruder fixtures that keep per-extruder values |
| GCP-101 | bug | S | 2 | sonnet | 02:31 | 02:46 | 16 | $0.41 | Show the GL failure message when a context restore fails |
| VWR-1 | spike | S | 2 | opus | 02:31 | 02:46 | 16 | $1.09 | Spike: pick the XML parser and confirm raw zip entry copy |
| VWR-34 | chore | S | 2 | sonnet | 02:31 | 02:46 | 16 | $0.31 | Create the `mesh` module |
| PRF-1 | chore | S | 2 | sonnet | 02:31 | 02:46 | 16 | $0.41 | Create the `profile-api` module |
| PRF-15 | feature | M | 3 | opus | 04:11 | 04:26 | 15 | $2.03 | Extend the catalogue with Bambu Studio keys and the bambu. prefix |
| GCP-108 | chore | S | 2 | sonnet | 03:22 | 03:35 | 13 | $0.54 | Give ToolheadWindow a public transfer form and a planner-free sampler entry |
| GCP-96 | feature | M | 3 | sonnet | 03:22 | 03:35 | 13 | $0.41 | Add width, flow, fan and temperature colour modes |
| VWR-35 | chore | M | 3 | sonnet | 03:22 | 03:35 | 13 | $0.33 | Capture the STL and OBJ corpus |
| VWR-40 | feature | S | 2 | sonnet | 03:30 | 03:42 | 12 | $0.27 | Parse ASCII STL |
| VWR-389 | bug | M | 3 | opus | 03:59 | 04:11 | 12 | $1.31 | Make weld, computeStats and binary STL parsing work at 20 M triangles |
| PRF-9 | feature | S | 2 | sonnet | 03:30 | 03:42 | 12 | $0.47 | Apply overrides[] blocks with match first or all |
| PRF-177 | bug | S | 2 | opus | 03:59 | 04:11 | 12 | $1.85 | Match newlines in conditions the way PrusaSlicer's Boost regex does |
| GCP-98 | bug | M | 3 | opus | 02:31 | 02:42 | 11 | $2.16 | Stop false unknown-command warnings on Bambu files and make the bambu and prusa-buddy catalogues selectable |
| GCP-100 | bug | S | 2 | sonnet | 02:42 | 02:52 | 10 | $1.09 | Detect the flavour from the end-of-file config block too |
| GCP-15 | feature | M | 3 | sonnet | 04:06 | 04:16 | 10 | $0.66 | Write the read-only zip entry reader |
| VWR-2 | chore | S | 2 | sonnet | 02:42 | 02:53 | 10 | $0.35 | Create the `3mf` module |
| VWR-39 | feature | M | 3 | sonnet | 03:25 | 03:35 | 10 | $0.33 | Parse binary STL with guard rails |
| VWR-41 | feature | M | 3 | sonnet | 03:33 | 03:42 | 9 | $0.27 | Parse OBJ with groups |
| VWR-38 | feature | S | 2 | sonnet | 02:39 | 02:46 | 8 | $0.31 | Define IndexedMesh, MeshStats and mesh errors |
| GCP-102 | bug | S | 2 | sonnet | 02:39 | 02:46 | 7 | $0.41 | Move the webview's slider, toggle and saved-view rules into a pure tested function |
| VWR-3 | feature | S | 2 | sonnet | 02:45 | 02:53 | 7 | $0.35 | Define the 3MF error classes and Package types |
| PRF-2 | feature | M | 3 | sonnet | 02:39 | 02:46 | 7 | $0.41 | Define the profile entity types and shared fields |
| GCP-111 | bug | S | 2 | sonnet | 04:32 | 04:34 | 2 | $0.19 | Move the .gcode.3mf readers to a parser subpath so the preview can take gcode-parser 0.12 |
| VWR-73 | chore | XS | 1 | sonnet | 04:06 | 04:06 | 0 | - | Release 3mf@0.1.0: container API (open, parts, replace, add, remove, save) |
| VSS-45 | chore | S | 2 | opus | 04:37 | - | - | $0.39 | SP6: audit review and bugfix |
| VSS-80 | chore | S | 2 | opus | 04:37 | - | - | $0.33 | SP6: retro |
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
| VWR-10 | chore | M | 3 | sonnet | - | - | - | - | Capture Bambu Studio and OrcaSlicer fixture projects |
| VWR-11 | chore | S | 2 | sonnet | - | - | - | - | Capture PrusaSlicer 2.9 and Prusa 3.0 alpha fixture projects |
| VWR-12 | chore | S | 2 | sonnet | - | - | - | - | Capture Cura workspace fixture projects |

By effort:

| Effort | Cards | Done | Median minutes | Minutes per point | Cost |
|---|---|---|---|---|---|
| L | 3 | 1 | 43 | 8.6 | $4.33 |
| M | 40 | 32 | 25 | 8.5 | $37.57 |
| S | 42 | 25 | 16 | 8.6 | $24.00 |
| XS | 4 | 4 | 27 | 20.2 | $0.80 |

By model:

| Model | Cards | Done | Median minutes | Minutes per point | Cost |
|---|---|---|---|---|---|
| opus | 19 | 12 | 23 | 8.2 | $31.65 |
| sonnet | 70 | 50 | 23 | 9.0 | $35.06 |

By type:

| Type | Cards | Done | Median minutes | Minutes per point | Cost |
|---|---|---|---|---|---|
| bug | 13 | 12 | 16 | 9.0 | $9.58 |
| chore | 24 | 10 | 16 | 8.0 | $5.62 |
| feature | 47 | 38 | 25 | 9.0 | $41.57 |
| spike | 5 | 2 | 23 | 7.8 | $9.93 |

## Reading the facts table

**Started** is the coordinator's move to doing at dispatch and **Done** is the commit that brought the
card into `done/`. 42 of 62 done cards were committed within 5 minutes of the reviewer's move to done
(SP5 18 of 24). The 20 later ones are almost all cards whose review passed while a long agent held the
next wave: the 02:55 wave (PLT-192, below) held GCP-99, GCP-105, GCP-40, PRF-3, PRF-6, VWR-4, VWR-14,
VWR-42 and VWR-43 13 to 26 minutes before their commits at 03:12 to 03:21, and the 03:43 wave (VWR-37)
held PRF-8, PRF-13, PRF-14, GCP-109 and VWR-47 12 to 14 minutes. The coordinator commits only between
waves, so the Minutes column again measures the barrier as much as the card. From the move events,
**doing to done has a median of 12.3 minutes** (SP5 10.3); the longest are the fix-round cards PRF-8
53.3, PRF-12 40.7, VWR-16 39.7, PRF-7 37.3, VWR-5 and VWR-6 34.3.

All S, M and L cards ran at 8.5 to 8.6 wall minutes a point (SP5 3.4 to 7.4): sizes are relatively right,
and the wall time per point is the waves', not the cards'. XS reads 20.2 because GCP-104, 105 and 106 rode
with larger cards. VWR-73 (the 3mf release) is a coordinator card moved through in one second.

### Points: what close-sprint will record

`close_sprint` sums every card whose `sprint` is `VSS:SP6` at close, done or not (rule 24):

| | Points |
|---|---|
| Done cards in the facts table (62, including 74 points pulled in from SP7 and 13 created in the sprint) | 155 |
| VSS-45 (audit review and bugfix) and VSS-80 (this retro), if done before close | 4 |
| **Completed, as close-sprint will record it** | **159** |
| Committed, as close-sprint will record it (facts table; this retro re-sizes no SP6 card) | 223 |
| GCP-107, GCP-110, PLT-193 (created in SP6 with `sprint: VSS:SP7`) | not counted |

SP6 closes at **159 of 223**. Velocity below uses the 155 delivered points to the last card.

### Agents, from the start and stop events

111 agents from 02:27:19 (SP5 closed) to 04:36:07 (the last commit after the clean-registry ci): the
coordinator's own session (`a3ed806`) and the SP6 audit and retro agents (04:38) excluded. Agents that
started within 30 seconds of each other are one dispatch message. Wave 1 is the one-agent message of the
dispatch experiment; the coordinator's "wave 4" and "wave 9" are waves 5 and 10 here.

| Wave | Start | Agents | Median run (min) | Longest (min) | Last stop | Gap to next | Finished agents waited (agent-min) |
|---|---|---|---|---|---|---|---|
| 1 | 02:31:41 | 1 | 5.6 | GCP-98 (Opus), alone | 02:37:17 | 0.9 | 0 |
| 2 | 02:38:11 | 6 | 2.0 | VWR-1 spike (Opus) 3.5 | 02:41:40 | 1.8 | 8.4 |
| 3 | 02:43:26 | 7 | 1.1 | GCP-100 2.8 | 02:46:20 | 1.9 | 9.3 |
| 4 | 02:48:14 | 10 | 1.4 | VWR-4+5+6 4.1 | 02:52:26 | 2.6 | 21.6 |
| 5 | 02:55:01 | 14 | 1.6 | **PLT-192 16.3** | 03:11:43 | 2.2 | **189.8** |
| 6 | 03:13:57 | 12 | 1.8 | PLT-192 review 6.0 | 03:20:11 | 3.4 | 41.7 |
| 7 | 03:23:37 | 13 | 2.0 | VWR-15 review 6.1 | 03:29:49 | 1.9 | 41.4 |
| 8 | 03:31:40 | 10 | 1.8 | VWR-9 review 2.8 | 03:34:41 | 1.8 | 10.3 |
| 9 | 03:36:27 | 7 | 1.4 | PRF-8 second fix (Opus) 5.8 | 03:42:12 | 1.7 | 26.2 |
| 10 | 03:43:54 | 7 | 3.4 | **VWR-37 spike (Opus) 15.2**, PRF-14 (Opus) 9.7 | 03:59:11 | 1.4 | **64.5** |
| 11 | 04:00:37 | 6 | 2.3 | PRF-177 (Opus) 4.5 | 04:05:07 | 1.9 | 11.7 |
| 12 | 04:06:59 | 4 | 1.6 | VWR-389+PRF-177 review (Opus) 4.0 | 04:11:03 | 1.1 | 8.4 |
| 13 | 04:12:12 | 5 | 1.3 | PRF-15 (Opus) 4.1 | 04:16:22 | 0.7 | 11.9 |
| 14 | 04:17:06 | 2 | 1.4 | PRF-15 review 1.9 | 04:19:01 | 0.4 | 0.9 |
| 15 | 04:19:25 | 2 | 1.0 | PRF-15 fix 1.2 | 04:20:41 | 0.2 | 0.5 |
| 16 | 04:20:55 | 2 | 1.9 | GCP-16 re-review 3.2 | 04:24:06 | 0.4 | 2.5 |
| 17 | 04:24:29 | 1 | 1.6 | GCP-16 second fix (Opus) | 04:26:04 | 0.5 | 0 |
| 18 | 04:26:34 | 1 | 1.7 | GCP-16 third review | 04:28:15 | 4.1 (releases) | 0 |
| 19 | 04:32:22 | 1 | 0.7 | GCP-111 | 04:33:05 | 3.0 (to the ci commit) | 0 |

From 02:27:19 to 04:36:07 (128.8 minutes): **273.0 agent-minutes**, mean **2.12 running agents** (SP5
1.54, SP4 2.34), peak 14. Agent time per done point: **1.76** (SP5 1.6, SP4 3.2). Opus workers 56.3
minutes for 36 done points (1.6 a point, SP5 1.9), Opus fixes 25.5 (six), Opus reviews 28.7 (nine);
Sonnet workers 73.5 minutes for 119 points (0.6 a point, SP5 0.9), Sonnet fixes 18.4 (eleven), Sonnet
reviews 70.6 (46). Reviews and fixes were 143 of 273 agent-minutes (52%).

**No commit and no board event by the coordinator falls inside a running wave.** All 52 commits and every
`sp6-coord` move, update, create and note land between one wave's last stop and the next wave's start.

**A worker's stop to its review's start: median 5.3 minutes** (SP5 4.6) over 38 workers; the longest,
17.1 to 17.3 (PRF-8, VWR-7, GCP-103+104+106), are workers of wave 5 that stopped at 02:57 and waited for
PLT-192. Rule 17's test (median under 10) passes; finished agents waited **449 agent-minutes** (SP5 98),
254 of them in waves 5 and 10.

## The dispatch experiment

The owner asked the coordinator to send each agent in its own message with `run_in_background: true`,
expecting completions to arrive one at a time while the coordinator kept working.

- **What happened** (coordinator; the events confirm it). At 02:31:04 to 02:31:05 the coordinator moved
  six cards to doing (GCP-98, GCP-99, GCP-101, VWR-1, VWR-34, PRF-1) and sent the GCP-98 worker (Opus)
  alone at 02:31:41. That call did not return until the agent stopped at 02:37:17 (5.6 minutes). In that
  window no other agent started and the coordinator wrote no event: its next one is a note at 02:37:35.
  The other five cards sat in doing for 7 minutes before their agents started at 02:38:11.
- **Result: one agent per message serialises the sprint.** A background Agent call still blocks its
  message until the agent stops, so one agent per message means one agent at a time. The completions did
  not arrive while the coordinator worked; the coordinator did not work.
- **Cost.** About 6.5 minutes of five idle lanes at the start (estimate: about 8 points at the sprint's
  73 an hour). Had the whole sprint run that way, 111 agents and 273 agent-minutes in series plus a
  message gap of about 1.5 minutes each would take about 7 hours instead of 2.1 (estimate, not measured).
- **Fallback** (coordinator; the events confirm it). From 02:38 the coordinator went back to SP5's method:
  waves of agents in one message, two or three cards in sequence per lane agent (PRF-1+2, VWR-34+38,
  VWR-4+5+6, GCP-104+106+103, VWR-36+40+41 review), reviews in the next message. 18 more waves followed.

### Idle share against rule 11's 15%

| Window | Minutes | No agent running | Share |
|---|---|---|---|
| Whole sprint, 02:27:19 to 04:36:07 (the ci commit) | 128.8 | 36.3 | **28%** |
| Without the start and the one-agent message (from 02:37:17) | 118.8 | 32.0 | 27% |
| Without the end-of-sprint releases and ci (to 04:28:15) | 120.9 | 29.2 | 24% |
| Without both: 02:38:11 (wave 2) to 04:28:15 | 110.1 | 23.9 | **22%** |

The idle time is 4.4 minutes at the start (02:27:19 to 02:31:41: the lane plan), 7.1 at the end (releases,
GCP-111, the ci and the attribution fix) and 24.8 in 17 gaps between waves (0.2 to 3.4, median 1.7; SP5
15.9 in ten, median 1.2). The one-agent message itself is not idle (an agent ran) but ran one lane where
five were ready. **Rule 11's 15% was missed again** (SP5 29% on the same basis, now 22%); three gaps
were over the 2 minutes rule 11 allows (2.6, 2.2 and 3.4, the last two after waves 5 and 6, whose
reviews released ten cards for commit at once).

## On time or not

**Early, out of planned work, and two workable cards left in SP7.** The last card was done at 04:34:10
(`2b522ab`), the ci passed at 04:36:07 (`8453720`), the trim commit followed at 04:37:54, **56 minutes
before the planned end of 05:30**.

| | Points |
|---|---|
| Committed at the start (derived: 223 now, less 87 added, plus 80 moved to SP7) | 216 |
| Owner-blocked: the 22 SP5 carry-overs (57, Q7, Q8, Q12, Q14 to Q16, hardware, exports) and VWR-10 to 12 (7, Q19) | 64 |
| Audit and retro cards | 4 |
| Moved to SP7 (coordinator: decided at the start by lanes; the board events write them at 03:21 to 03:22, with Q19 at 03:22:03) | 80 |
| Workable at the start: GCP-98 to 106, 40, 96, 97 (26), VWR-1 to 9, 14 to 17, 34, 73 (37), PRF-1, 2 (5) | 68 |
| Pulled in from SP7: mesh VWR-35 to 48 and 38 (34), profiles PRF-3 to 9, 12 to 15 (31), GCP-34, 15, 16 (9) | 74 |
| Created in the sprint with `sprint: VSS:SP6`: PLT-192, GCP-108, GCP-109, VWR-389, PRF-177, GCP-111 | 13 |
| Done | **155** (every workable and added card; 159 at close with the audit and retro) |
| Sprint capacity (SP6 doc) | 92 |

**Velocity: 155 points in 127 minutes (02:27 to 04:34), 73.2 points an hour** (72.2 to the ci commit;
SP5 60.0, SP4 46.5). Four lanes carried it at the rate rule 23 predicts:

| Lane | Points | First dispatch to last card | Points an hour |
|---|---|---|---|
| `3mf` (VWR-1 to 9, 14 to 17, 73) | 35 | 02:31 to 04:06 | 22 |
| `mesh` (VWR-34 to 48, 389) | 39 | 02:31 to 04:16 | 22 |
| `profile-api` (PRF-1 to 9, 12 to 15, 177) | 38 | 02:31 to 04:26 | 20 |
| gcode modules (gcode-api, -language, -parser, -planner, -preview, webview-kit: GCP-15, 16, 34, 40, 96 to 111, PLT-192) | 43 | 02:31 to 04:34 | 20 |

Rule 10's formula, 128.8 minutes x 2.12 agents / 1.5, gives 182 points against 155: SP6 spent 1.76
agent-minutes a point, not 1.5, because reviews and fixes took half the agent time.

**Rule 23's test failed.** When the profile lane freed at 04:26 (PRF-15 done 04:21, committed 04:26),
PRF-16 (L, Prusa and SuperSlicer keys) and PRF-17 (M, Cura keys) in SP7 depended only on PRF-14, which was
done; neither was pulled in, and no agent was dispatched after 04:32. The other SP7 cards were blocked:
the dialect readers on VWR-10 to 12 (Q19), GCP-36 to 56 on D20, GCP-16's chain and Q7, GCP-107 on D17,
GCP-110 on Q7, VWR-45, 49 and 50 on CI or webview work. The events do not say why the coordinator stopped
at 04:34 (not recorded).

By effort, model and type (agent time from the events):

- **XS** (GCP-104, 105, 106, VWR-73): rode in multi-card agents of 1.6 to 1.7 minutes.
- **S**: Sonnet workers 0.9 to 2.9 (module creation PRF-1+2 2.9, VWR-34+38 1.7, VWR-2+3 2.7; GCP-111 0.7),
  **PLT-192 16.3**, the sprint's longest agent; Opus PRF-177 4.5, VWR-1 spike 3.5.
- **M**: Sonnet 1.0 to 4.1 per agent of one to three cards (GCP-34 2.8, GCP-15 1.6, GCP-16 1.6 plus two
  fixes), Opus 3.2 to 5.6 (GCP-98 5.6, VWR-46 3.2, PRF-7 3.2, PRF-12 4.3, VWR-8 3.6, VWR-389 3.5), and the
  **VWR-37 spike 15.2** (Opus, measured at 1, 5 and 20 M triangles, three runs a stage).
- **L**: PRF-14 (Opus) 9.7 plus a 1.5 fix.
- **By model**: Opus 1.6 agent-minutes a done point, Sonnet 0.6. Opus reviews (nine, 28.7 minutes) took
  the hostile-input cards (PRF-8, PRF-12, VWR-8, PRF-14, VWR-389, PRF-177, PRF-15).
- **By type**: bugs 12 of 13 done, **0 failed review** (PLT-181 is owner-blocked); new code 50 done, 13
  failed first review (below).

## Why

- *Long agents held two waves* (coordinator; the events confirm it). **PLT-192** (S, Sonnet, created at
  02:53 from GCP-96's split) added two shader modes and ran webview-kit's Playwright suite; it ran 16.3
  minutes with 13 agents whose median was 1.6, and moved its own card review to review four times
  between 03:03 and 03:11 while iterating. The wave's finished agents waited 190 agent-minutes, the
  failed reviews of PRF-7 (02:56) and VWR-5+6 (02:58) waited 16 to 18 minutes for their fix agents
  (03:13:57), and nine passed cards waited 13 to 26 minutes for their commits. Nobody expected a long
  agent: the card was S. **VWR-37** (M, Opus measuring spike) and **PRF-14** (L, Opus) went out in one
  message with five short agents (wave 10); the spike was known to measure at 20 M triangles three times
  a stage, and rule 17 says such agents go alone or last. That wave's finished agents waited 64.5
  agent-minutes. Together waves 5 and 10 hold 254 of the 449 waiting agent-minutes and 32 of the 129
  minutes of sprint.
- *Fix rounds* (coordinator; confirmed by the move events): 13 cards failed first review (VWR-5 and VWR-6 share a row), 14 fix agents:

  | Card | Failed review | Done | Wall | Rounds | Finding |
  |---|---|---|---|---|---|
  | PRF-7 | 02:56:08 | 03:24:30 | 28.4 | 1 | nesting with no limit: deep input threw RangeError; capped at 64 levels and 64 KiB |
  | VWR-5, VWR-6 | 02:58:02 | 03:25:29 | 27.5 | 1 (one agent) | zip bomb: a single `inflate.push` inflated the whole entry before the cap; streamed cap, 1 GiB bomb test |
  | PRF-12 | 03:19:26 | 03:34:16 | 14.8 | 1 | catalogue contract gaps (notice, legacy and pinned flags, key patterns) |
  | PRF-8 | 03:19:26 | 03:46:54 | 27.5 | 2 (three reviews) | regex backtracking on hostile conditions: a denylist and a step budget failed review, then an own Thompson-NFA matcher, linear by construction |
  | VWR-36 | 03:25:00 | 03:37:56 | 12.9 | 1 | generated fixture was not a closed mesh (4008 open edges) |
  | VWR-8 | 03:26:35 | 03:42:37 | 16.0 | 1 | overlapping entries, shared offsets and duplicate names accepted |
  | VWR-15 | 03:29:43 | 03:37:51 | 8.1 | 1 | index wrap at 2^32 and unbounded XML nesting |
  | VWR-16 | 03:37:51 | 04:01:55 | 24.1 | 1 (with VWR-17) | cycle check keyed on bare object id rejected valid Production files |
  | VWR-48 | 04:02:12 | 04:12:54 | 10.7 | 1 | a synchronous `postMessage` DataCloneError left the worker running |
  | PRF-14 | 04:03:31 | 04:13:03 | 9.5 | 1 | provenance lines and the AGPL notice on generated data |
  | GCP-16 | 04:18:01 | 04:28:11 | 10.2 | 2 | quadratic regexes on tags with no closing `>` (6.8 s at 256 KiB), then a linear tag scanner |
  | PRF-15 | 04:18:47 | 04:21:31 | 2.7 | 1 | PRF-14's determinism test failed without a Bambu checkout |

  **13 of 62 done cards (1 in 4.8) failed first review: rule 19's amended 1 in 5 held.** All 13 are new
  code; the 12 bug cards passed first time. Wall time per failed card 2.7 to 28.4 minutes, median 14.8
  (rule 19 budgets 8): the early ones waited out wave 5. **Seven of the thirteen were resource bounds on
  hostile input** (PRF-7, VWR-5+6, PRF-8, VWR-8, VWR-15, GCP-16), and so was VWR-389 (from the VWR-37 spike
  for 20 M triangles): cards that parse untrusted bytes (zip, XML, regexes in profile conditions, Bambu
  tags) named the format but not the bounds, and reviewers found them by probing.
- *Releases and the ci* (coordinator; the log confirms the versions): gcode-api 0.7.0 (`f322497`),
  webview-kit 0.6.0 and gcode-language 0.2.0 (`5842273`), gcode-planner 0.5.0 (`236a63c`), 3mf 0.1.0
  (`a2e6fc1`), gcode-parser 0.12.0 (`72303fd`), gcode-preview 0.4.0 (`7b6ae33`), then gcode-parser 0.13.0,
  gcode-preview 0.4.1 and test-webview 0.2.1 (`2b522ab`). **Rule 21 broke for two modules:** gcode-parser
  0.12.0 put `@vsslicer/3mf` (and through it saxes) in its main entry; the preview's notices check refused
  saxes's missing licence file, and GCP-111 moved the `.gcode.3mf` readers to a subpath. The clean-registry
  ci passed on its third run: first stale pins from the held-back preview, then the licence check's
  "Ported from" rule on two PRF-14 and PRF-15 test files (`8453720`). profile-api and mesh were not
  released (PRF-135 and VWR-75 are in SP7). About 8 minutes at the end.
- *Stray files and board slips* (coordinator; not in the events except the moves). Workers ran
  `prettier --write` over whole modules, touching files outside their card; one worker truncated and
  rewrote its own card (VWR-2, now 30 lines); reviewers twice passed a card without moving it (VWR-8,
  GCP-34): the move events show `sp6-coord` moving both to done (03:42:37, 04:05:34). The coordinator
  restored the rest. Rule 22's target of zero was missed again.
- *Plan and pull-ins* (coordinator; the update and create events confirm the pull-ins). The lanes plan
  (rule 23) gave 3mf, mesh, profile-api, gcode-language, parser and planner, preview and webview-kit lanes.
  The 3mf dialect readers (VWR-13, 20 to 33, 74) went to SP7 because VWR-10 to 12 need owner GUI exports
  (Q19, asked 03:22:03); GCP-34, 36, 39, 41, 42, 50 to 56 for D20, GCP-16 and Q7. Then 74 points came back
  as the lanes freed: VWR-38 (02:37), VWR-42, 43, PRF-3, 6, 7 (02:47), VWR-46, PRF-8, 12 (02:53), VWR-44,
  36, PRF-4, 5 (03:12), VWR-35, 39 (03:22), VWR-40, 41, PRF-9 (03:30), PRF-13 (03:35), VWR-47, 48, 37,
  PRF-14, GCP-34 (03:42 to 03:43), GCP-15 (04:06), PRF-15, GCP-16 (04:11). Rule 23's pull-in list worked
  for 74 points; it stopped one step early (PRF-16, 17).
- *Work created in the sprint* (create events): GCP-96 split into PLT-192 (kit, SP6) and GCP-107 (fan and
  temperature, SP7, D17) at 02:53; GCP-108 (03:22) and GCP-109 (03:35) split ToolheadWindow's transfer form
  from GCP-97's follow-up; PLT-193 (03:30, SP7); VWR-389 and PRF-177 (03:59) from the VWR-37 spike and
  PRF-8's review; GCP-110 (04:05, SP7); GCP-111 (04:30) from the release failure.
- *Coordinator time between waves.* 24.8 minutes in 17 gaps, median 1.7. The commits per gap grew with
  the lanes: after wave 5 the coordinator committed 10 cards and two releases (03:20:41 to 03:21:29) in a
  2.2-minute gap, after wave 6 four more in 3.4. Sending a gap's commits in the same message as the next
  wave's Agent calls (rule 11's untried mitigation) was not tried in SP6 either (not in the events).

## Change

In `.ai/plans/estimation.md`: rules 11, 17, 18, 19, 21, 22 and 23 amended, rule 25 added, "Current
calibration" updated, each with its evidence.

- **Rule 11 amended:** one agent per message is not per-lane dispatch: a background Agent call blocks
  its message until the agent stops (SP6 GCP-98, 5.6 minutes, no other agent, no coordinator event).
  Dispatch in waves; the idle target stays 15%, measured from the first wave to the last review (SP6
  22%, SP5 29%). Try the gap's commits in the same message as the next wave.
- **Rule 17 amended:** any card that runs a browser or VS Code suite (Playwright, `@vscode/test-electron`)
  or measures repeatedly counts as long whatever its size, and goes in a message only with other long
  agents or last. Testable: finished agents wait under 150 agent-minutes a sprint (SP6 449: PLT-192 190,
  VWR-37 64.5).
- **Rule 18 amended:** a measuring card (spike or CI benchmark over large inputs) is at least L. SP6
  VWR-37 (M) ran 15.2 agent-minutes, about five times an Opus M build.
- **Rule 19 amended:** the 1-in-5 rate held (13 of 62, all new code; bugs 0 of 12); budget the wall at
  about 15 minutes a failed card under waves.
- **Rule 21 amended:** before publishing a module that gains a runtime dependency, run the consumers'
  notices and licence checks against it; a dependency only some consumers need goes on a subpath export.
  Testable: one version per module (SP6 gcode-parser and gcode-preview two each).
- **Rule 22 amended:** workers format only the files they changed (`prettier --write <files>`), write to
  their card only by appending under Progress, and a reviewer's last step is the `board.py move`; the
  coordinator's `git status --short` check stays.
- **Rule 23 amended:** confirmed at 20 to 22 points an hour per lane with four lanes (73.2 an hour); the
  pull-in list runs until the sprint's end, not until the planned cards are done (SP6 stopped 56 minutes
  early with PRF-16 and PRF-17 workable).
- **Rule 25 added: a card that parses untrusted input names its resource bounds.** Size, nesting, count
  and time bounds (and linear-time scanning: no backtracking regexes over input) go in its acceptance
  criteria at planning, with a hostile-input test. Testable: at most one fix round in a sprint for a
  resource-bound finding (SP6 seven, and VWR-389).

## Re-sizing

With `board.py --agent sp6-retro set`, owner-facing scope unchanged (rule 18 as amended):

- **VWR-32** (Generate a 500 MB 3MF and measure host blocking, SP7) M to **L**.
- **VWR-50** (Record parse, dedup and BVH time and memory in CI, SP7) M to **L**.
- **GCP-42** (Record host, worker and webview memory at 50, 200 and 500 MB, SP7) M to **L**.

No SP6 card was re-sized, so the close figure above stands. For the SP7 coordinator (not changed here):

- **Pull in PRF-16 and PRF-17 first**: workable since PRF-14 was done at 04:13.
- **Cards to dispatch as long agents (rule 17):** GCP-110 and PLT-46 (Playwright), VWR-32, VWR-50 and
  GCP-42 (measuring), PRF-16 (L, Opus, about 1,540 Prusa and SuperSlicer keys against PRF-14's 9.7 minutes).
- **Cards that parse untrusted input and need bounds written in (rule 25):** VWR-21 to 28 (dialect
  readers over project XML and embedded configs), VWR-31 (worker parsing), GCP-36 (side panel over
  `.gcode.3mf` plates), PRF-20 (conversions over profile values).
