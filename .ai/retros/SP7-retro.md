# SP7 retro: Open 2

Card VSS-81. Written by the retro agent, who wrote none of SP7's code. Sources: `board.py retro SP7`
(below, unedited), the start, stop, dispatch, move, create, update and note events in
`.ai/local/taskboard/activity.jsonl` from 2026-10-26T04:48, the cards' Progress in
`.ai/kanban/projects/{viewer,profiles,gcode,platform}/`, and `git log ed86b9e..HEAD` (43 commits, `b9cf852`
05:05 to `8fefca0` 07:06), and the clean-registry ci log `/private/tmp/claude-501/sp7-ci.log`. Facts the
coordinator supplied are marked "(coordinator)" and were checked against the events where the events can
show them. The audit (VSS-46) ran in parallel; its findings are not in this retro.

## SP7 Open 2: the facts

- Planned: 2026-10-26T04:48+00:00 to 2026-10-26T07:30+00:00, 235 points (87.0 points/hour)
- Actual: last card done 2026-10-26T07:06+00:00, 75 points (32.6 points/hour), -24 minutes after the planned end

| Card | Type | Effort | Points | Model | Started | Done | Minutes | Cost | Title |
|---|---|---|---|---|---|---|---|---|---|
| PRF-17 | feature | M | 3 | opus | 04:53 | 06:50 | 116 | $5.99 | Extend the catalogue with Cura keys |
| PRF-16 | feature | L | 5 | opus | 04:53 | 06:50 | 116 | $19.14 | Extend the catalogue with PrusaSlicer 2.9, 3.0 and SuperSlicer keys |
| PRF-120 | chore | S | 2 | sonnet | 04:53 | 06:45 | 112 | $0.25 | Create the `profiles-orca` module |
| PRF-121 | chore | S | 2 | sonnet | 04:53 | 06:45 | 112 | $0.25 | Create the `profiles-cura` module |
| PRF-119 | chore | S | 2 | sonnet | 04:53 | 06:45 | 112 | $0.25 | Create the `profiles-prusa` module |
| PRF-122 | feature | S | 2 | sonnet | 04:53 | 06:45 | 112 | $0.53 | Define ImportResult, Diagnostic and the printer-instance import result types |
| PRF-21 | spike | S | 2 | opus | 04:53 | 06:45 | 112 | $2.54 | Spike: can the upstream CLIs print a resolved config to use as an oracle |
| PRF-22 | spike | S | 2 | sonnet | 04:53 | 06:45 | 112 | $0.54 | Spike: VSIX size of the Orca and Bambu data package |
| GCP-113 | bug | S | 2 | sonnet | 04:53 | 06:42 | 108 | $1.25 | Add 'restore' to GlFailureCause and drop the preview's cast |
| GCP-36 | feature | L | 5 | sonnet | 04:53 | 06:13 | 80 | $3.58 | Add the side panel: thumbnails, labels, summary and plate picker |
| PRF-104 | feature | S | 2 | sonnet | 05:39 | 06:50 | 71 | $1.31 | Model and validate bundle_structure.json |
| PLT-194 | chore | S | 2 | sonnet | 05:39 | 06:45 | 66 | $2.04 | Let third-party-notices take a vendored licence text for packages that ship none |
| PRF-118 | chore | S | 2 | sonnet | 05:39 | 06:45 | 66 | $0.51 | Create the `profiles` module |
| PRF-83 | feature | S | 2 | sonnet | 05:39 | 06:45 | 66 | $0.60 | Validate printer_instance connections against the static host_type list |
| PRF-123 | feature | M | 3 | opus | 05:39 | 06:45 | 66 | $1.51 | Define the Importer, Exporter and ProfileStore read ports |
| VSS-471 | chore | S | 2 | sonnet | 04:53 | 05:38 | 45 | $0.43 | Skip publishing unreleased 0.0.0 modules in run.mjs |
| GCP-112 | bug | S | 2 | sonnet | 04:53 | 05:37 | 44 | $0.52 | Check slice_info.config's size before inflating it |
| VWR-393 | bug | S | 2 | sonnet | 04:53 | 05:37 | 44 | $0.55 | Check the triangle cap while parsing OBJ and ASCII STL |
| PRF-178 | bug | S | 2 | sonnet | 04:53 | 05:38 | 44 | $0.53 | Make the regex timing tests independent of machine load |
| PRF-41 | chore | M | 3 | sonnet | 06:03 | 06:45 | 42 | $1.47 | Create the `profiles-data-orca` module with the Orca and Bambu JSON trees |
| GCP-39 | feature | M | 3 | sonnet | 06:13 | 06:50 | 36 | $1.58 | Show diagnostics and flags, and the lazy G-code text pane |
| PRF-18 | feature | M | 3 | opus | 06:13 | 06:50 | 36 | $9.63 | Assign groups, home entities, hidden keys and override scopes |
| VWR-51 | chore | S | 2 | sonnet | 06:03 | 06:38 | 35 | $0.74 | Create the `project-extension` module |
| GCP-110 | chore | M | 3 | sonnet | 06:14 | 06:42 | 28 | $0.88 | Snapshot real corpus files through the preview's webview |
| GCP-114 | bug | S | 2 | sonnet | 05:50 | 06:13 | 23 | $0.86 | Refuse oversize plate thumbnails before inflating them |
| PRF-19 | feature | M | 3 | sonnet | 06:52 | 07:06 | 14 | $1.02 | Add the catalogue coverage test over the pinned key lists |
| PRF-20 | feature | M | 3 | sonnet | 06:52 | 07:06 | 14 | $1.68 | Fill the 56 mapped keys of profiles.md section 6 with conversions and tests |
| VWR-391 | bug | S | 2 | sonnet | 04:53 | 05:05 | 11 | $0.51 | Skip the 3mf real-file suites when .reference is absent |
| VWR-390 | bug | S | 2 | sonnet | 04:53 | 05:05 | 11 | $0.51 | Cap the parts and triangles resolveProject builds from nested components |
| VWR-392 | bug | S | 2 | sonnet | 04:53 | 05:05 | 11 | $0.51 | Refuse a 3MF whose declared inflated sizes exceed a total cap |
| PRF-135 | chore | XS | 1 | sonnet | 07:06 | 07:06 | 0 | - | Release `profile-api@0.1.0`: entities, JSON Schema, catalogue, merge and condition evaluator |
| VSS-46 | chore | S | 2 | opus | 06:51 | - | - | $0.22 | SP7: audit review and bugfix |
| VSS-81 | chore | S | 2 | opus | 06:51 | - | - | $0.18 | SP7: retro |
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
| PLT-193 | chore | XS | 1 | sonnet | - | - | - | - | Add gcode-language to the extension pack |
| PLT-1 | chore | S | 2 | sonnet | - | - | - | $0.16 | Create the public GitHub repository and protect main |
| PLT-9 | feature | M | 3 | sonnet | 20:25 | - | - | $0.44 | Add the CI workflow: one job per changed module on three operating systems |
| PLT-10 | feature | S | 2 | sonnet | 21:21 | - | - | $0.28 | Enforce DCO sign-off in CI |
| PLT-33 | spike | S | 2 | opus | 23:22 | - | - | $1.69 | Spike: WebGPU probe and workers under the kit CSP |
| PLT-31 | spike | S | 2 | opus | 23:22 | - | - | $5.74 | Spike: postMessage transferables versus fetch(asWebviewUri) for 50 to 500 MB |
| GCP-21 | chore | M | 3 | sonnet | - | - | - | - | Run klipper_estimator as a black-box oracle in CI |
| GCP-25 | chore | M | 3 | sonnet | - | - | - | - | Compare against PrusaSlicer M73 totals and per-layer progress |
| GCP-29 | chore | S | 2 | sonnet | - | - | - | - | Measure three H2C prints against the estimates |
| GCP-41 | chore | M | 3 | sonnet | - | - | - | - | Test the 50 MB-plus file through the custom editor |
| GCP-42 | chore | L | 5 | sonnet | - | - | - | - | Record host, worker and webview memory at 50, 200 and 500 MB |
| GCP-50 | feature | M | 3 | opus | - | - | - | - | Define and publish the exports and commands: open, follow, stopFollow |
| GCP-51 | feature | M | 3 | sonnet | - | - | - | - | Map file offsets to moves |
| GCP-52 | feature | S | 2 | sonnet | - | - | - | - | Map layer and percent positions |
| GCP-53 | chore | M | 3 | sonnet | - | - | - | - | Record feeds and test the API from a stub extension |
| GCP-54 | chore | S | 2 | sonnet | - | - | - | - | Add the api-extractor semver check to CI |
| GCP-55 | feature | L | 5 | sonnet | - | - | - | - | Add follow mode to the editor |
| GCP-56 | feature | S | 2 | sonnet | - | - | - | - | Stop follow on stale feed or file mismatch |
| GCP-107 | feature | L | 5 | opus | - | - | - | - | Add fan and temperature colour modes |
| GCP-79 | chore | S | 2 | sonnet | 00:09 | - | - | $0.69 | Extend the golden corpus to PrusaSlicer, SuperSlicer, Cura and Bambu multi-material |
| GCP-18 | feature | S | 2 | sonnet | 00:14 | - | - | $0.87 | Benchmark memory and throughput on synthetic 50, 200 and 500 MB files in CI |
| VWR-10 | chore | M | 3 | sonnet | - | - | - | - | Capture Bambu Studio and OrcaSlicer fixture projects |
| VWR-11 | chore | S | 2 | sonnet | - | - | - | - | Capture PrusaSlicer 2.9 and Prusa 3.0 alpha fixture projects |
| VWR-12 | chore | S | 2 | sonnet | - | - | - | - | Capture Cura workspace fixture projects |
| VWR-13 | feature | S | 2 | sonnet | - | - | - | - | Detect the writer dialect from metadata and parts |
| VWR-18 | chore | M | 3 | sonnet | - | - | - | - | Run the 3MF Consortium conformance suite in CI |
| VWR-19 | chore | M | 3 | opus | - | - | - | - | Add lib3mf WASM as the CI oracle for counts |
| VWR-20 | feature | S | 2 | sonnet | - | - | - | - | Implement readProject and the dialect dispatch |
| VWR-21 | feature | M | 3 | opus | - | - | - | - | Read Bambu and Orca project config and embedded presets |
| VWR-22 | feature | M | 3 | opus | - | - | - | - | Read Bambu and Orca objects, parts and instances |
| VWR-23 | feature | M | 3 | sonnet | - | - | - | - | Read Bambu and Orca plates and slice info |
| VWR-24 | feature | S | 2 | sonnet | - | - | - | - | Read Bambu and Orca layer data and cut information |
| VWR-25 | feature | M | 3 | opus | - | - | - | - | Read PrusaSlicer 2.x config and objects |
| VWR-26 | feature | S | 2 | sonnet | - | - | - | - | Read PrusaSlicer 2.x per-layer data |
| VWR-27 | feature | S | 2 | sonnet | - | - | - | - | Read Cura workspace containers |
| VWR-28 | feature | S | 2 | sonnet | - | - | - | - | Open Prusa 3.0 alpha projects core-only |
| VWR-29 | chore | S | 2 | sonnet | - | - | - | - | Test untouched open and save for every dialect |
| VWR-30 | chore | S | 2 | sonnet | - | - | - | - | Test that all dialects read into one Project shape |
| VWR-31 | feature | M | 3 | sonnet | - | - | - | - | Run openPackage and readProject in a worker |
| VWR-32 | chore | L | 5 | opus | - | - | - | - | Generate a 500 MB 3MF and measure host blocking |
| VWR-33 | feature | S | 2 | sonnet | - | - | - | - | Publish the 3MF public API for other projects |
| VWR-45 | chore | S | 2 | sonnet | - | - | - | - | Run admesh as the oracle in CI |
| VWR-49 | feature | M | 3 | sonnet | - | - | - | - | Run mesh parsing in a Web Worker pool for the webview |
| VWR-50 | chore | L | 5 | opus | - | - | - | - | Record parse, dedup and BVH time and memory in CI |
| VWR-74 | chore | XS | 1 | sonnet | - | - | - | - | Release 3mf@0.2.0: readProject, dialect readers and the public API |
| VWR-75 | chore | XS | 1 | sonnet | - | - | - | - | Release mesh@0.1.0: parsers, stats, BVH and workers |
| PRF-179 | bug | S | 2 | opus | 04:53 | - | - | $1.50 | State profile-api's licence for the AGPL-3.0-only Orca and Bambu data and add PROVENANCE |

By effort:

| Effort | Cards | Done | Median minutes | Minutes per point | Cost |
|---|---|---|---|---|---|
| L | 9 | 2 | 116 | 19.6 | $22.71 |
| M | 28 | 8 | 36 | 14.7 | $24.21 |
| S | 51 | 20 | 66 | 32.9 | $26.55 |
| XS | 4 | 1 | 0 | 0.0 | $0.00 |

By model:

| Model | Cards | Done | Median minutes | Minutes per point | Cost |
|---|---|---|---|---|---|
| opus | 21 | 5 | 112 | 27.9 | $48.14 |
| sonnet | 71 | 26 | 44 | 24.1 | $25.33 |

By type:

| Type | Cards | Done | Median minutes | Minutes per point | Cost |
|---|---|---|---|---|---|
| bug | 10 | 8 | 44 | 18.5 | $6.74 |
| chore | 38 | 10 | 66 | 29.4 | $8.07 |
| feature | 39 | 11 | 66 | 21.4 | $48.16 |
| spike | 5 | 2 | 112 | 56.0 | $10.50 |

## Reading the facts table

- **Started and Done are board times, not agent times.** The coordinator moved the first 20 cards to
  doing at 04:53:46 to 04:53:47, before most of their agents ran, and the Done column takes the cards'
  last change (06:42 to 06:50 for most), not the review pass. The reviewers' `move ... done` events are
  earlier: PRF-17 06:07:58, PRF-16 06:10:00, GCP-36 06:12:03, PRF-104 06:19:54, PLT-194 and PRF-41
  06:44:47, PRF-18 06:48:34, GCP-39 06:49:40. Agent time below comes from the start and stop events.
- PLT-9, PLT-10, PLT-31, PLT-33, GCP-79 and GCP-18 show start times from earlier sprints: they are
  carry-overs, not SP7 work.
- PRF-179 (S, Opus) ran in wave 2 (6.2 min) and is not done: its PROVENANCE was committed (`84338ed`),
  its licence field waits on the owner's Q20 (note 06:51:06).

### Points: what close-sprint will record

`close_sprint` sums every card whose `sprint` is `VSS:SP7` at close, done or not (rule 24):

| | Points |
|---|---|
| Done cards in the facts table (31: 12 pulled in from SP8 and SP9, 3 created in the sprint) | 75 |
| VSS-46 (audit review and bugfix) and VSS-81 (this retro), if done before close | 4 |
| **Completed, as close-sprint will record it** | **79** |
| Committed, as close-sprint will record it (facts table; this retro re-sizes no SP7 card) | 235 |
| PRF-179 (2, waits on Q20): counted in committed unless moved to SP8 before close (then 233) | 2 |

SP7 closes at **79 of 235**. Velocity below uses the 75 delivered points to the last card (07:06).

### Agents, from the start and stop events

54 agents from 04:54:31 (the first worker) to 07:05:37 (the last review's stop); the coordinator's own
session (`a6558fd`, 04:49:32) and the SP7 audit and retro agents (07:07) excluded. Agents that started
within 30 seconds of each other are one dispatch message.

| Wave | Start | Agents | Median run (min) | Longest (min) | Last stop | Gap to next | Finished agents waited (agent-min) |
|---|---|---|---|---|---|---|---|
| 1 | 04:54:31 | 1 | 2.9 | VWR-391+390+392, alone | 04:57:27 | 1.0 | 0 |
| 2 | 04:58:25 | 7 | 2.3 | PRF-179 (Opus) 6.2, PRF-178+122 5.8 | 05:04:39 | 1.8 | 20.6 |
| 3 | 05:06:25 | 8 | 6.1 | **PRF-16 (Opus) 30.7**, PRF-17 (Opus) 9.0 | 05:37:05 | 3.5 | **180.1** |
| 4 | 05:40:33 | 8 | 4.2 | PRF-16 review 9.4 | 05:49:57 | 1.6 | 44.2 |
| 5 | 05:51:32 | 6 | 3.9 | PRF-16 fix (Opus) 11.2 | 06:02:43 | 1.8 | 39.0 |
| 6 | 06:04:32 | 7 | 3.7 | GCP-36+114 re-review 7.8 | 06:12:23 | 2.3 | 27.8 |
| 7 | 06:14:43 | 5 | 5.3 | **PRF-18 (Opus) 23.1** | 06:37:46 | 1.2 | **72.8** |
| 8 | 06:38:57 | 4 | 1.9 | PRF-18 review 2.7 | 06:41:41 | 0.8 | 3.2 |
| 9 | 06:42:26 | 3 | 2.5 | GCP-39 fix 2.6 | 06:45:06 | 2.3 | 0.7 |
| 10 | 06:47:22 | 2 | 2.5 | GCP-39 re-review 2.5 | 06:49:52 | 2.6 | 0.9 |
| 11 | 06:52:30 | 2 | 6.5 | PRF-20 6.5 | 06:59:04 | 2.1 | 3.9 |
| 12 | 07:01:10 | 1 | 4.5 | PRF-19+20 review | 07:05:37 | - | 0 |

From 04:54:31 to 07:05:37 (131.1 minutes): **248.2 agent-minutes**, mean **1.89 running agents** (SP6
2.12), peak 8. Agent time per done point: **3.31** (SP6 1.76). Opus workers 80.5 minutes in six agents
(PRF-16 30.7, PRF-18 23.1, PRF-17 9.0, PRF-21 6.9, PRF-179 6.2, PRF-123 4.7), 74.3 for 16 done points
(4.6 a point, SP6 1.6); Opus fixes 24.8 (five), Opus reviews 75.3 (19); Sonnet workers 52.5 for 59
points (0.9 a point, SP6 0.6), Sonnet fixes 15.3 (seven). Reviews and fixes were 115.4 of 248.2
agent-minutes (46%, SP6 52%).

The coordinator's wave times (coordinator) run about 3 minutes later than the events (it gives the first
dispatch as 04:58 to 05:01 and the long wave as 05:08 to 05:38; the events say 04:54:31 to 04:57:27 and
05:06:25 to 05:37:05). The tables use the events. The coordinator's "VWR-391/390/392 sent alone" is
confirmed: one agent, 2.9 minutes, no other start.

**Finished agents waited 393 agent-minutes** (SP6 449; rule 17's target under 150): 180 in wave 3 behind
PRF-16, 73 in wave 7 behind PRF-18. Wave 3 held three reviews of wave-2 cards (stopped 05:10 to 05:14)
until 05:37: those cards' commits waited about 23 to 27 minutes (coordinator: "~25 min"; the events
agree).

### Idle share against rule 11's 15%

| Window | Minutes | No agent running | Share |
|---|---|---|---|
| Sprint open (04:48) to the last review's stop (07:05:37) | 137.6 | 27.4 | 20% |
| First wave's start (04:54:31) to the last review's stop (rule 11's basis) | 131.1 | 20.9 | **15.9%** |

The idle time is 6.5 minutes at the start (04:48 to 04:54:31: sprint plan, pull-ins and the VSS-471
card) and 20.9 in 11 gaps between waves (0.8 to 3.5, median 2.1; SP6 1.7). **Rule 11's 15% was missed by
0.9 points** (SP6 22%, SP5 29%): five gaps were over 2 minutes (3.5 after wave 3, which released nine
cards' commits and the webview-kit release at once; 2.3, 2.3, 2.6, 2.1 around the 06:45 to 06:50
releases).

## On time or not

**Early by the clock, short by points.** The last card was done at 07:06 (`8fefca0`, PRF-135), 24 minutes
before the planned end of 07:30; the clean-registry ci's fourth run (started 07:07) **failed** at 07:09 on
`check-licence` (`/private/tmp/claude-501/sp7-ci.log`, `exit=1`): `profile-api/test/catalogue-prusa.test.ts`
line 178 has "Ported from" without an upstream Copyright line (PRF-16's test), and
`profiles-data-orca/package.json` lacks `"license": "AGPL-3.0-or-later"` (PRF-41). The releases are
therefore not yet verified from a clean registry.

| | Points |
|---|---|
| Committed (facts table) | 235 |
| Not done: audit and retro cards | 4 |
| Not done: PRF-179 (Q20) | 2 |
| Not started: carry-overs and owner-blocked cards (coordinator: Q7, Q8, Q12, Q14, Q15/16, Q17 to Q20, D14, D16 to D20, owner slicer exports; GCP-107 waits on D17, VWR-13 on VWR-10 to 12, VWR-49 on PLT-36/37, per their cards) | 154 |
| Done | **75** (79 at close with the audit and retro) |

**Velocity: 75 points in 138 minutes (04:48 to 07:06), 32.6 points an hour** (SP6 73.2). The plan's 87 an
hour counted 154 points that could not start. By lane:

| Lane | Points | First dispatch to last card | Points an hour |
|---|---|---|---|
| profiles (`profile-api`, `profiles*`: PRF-16 to 22, 41, 83, 104, 118 to 123, 135, 178) | 44 | 04:58 to 07:06 | 20.6 |
| gcode (`gcode-preview`, `3mf` plate reader: GCP-36, 39, 110, 112 to 114) | 17 | 04:58 to 06:50 | 9 |
| viewer (`3mf`, `mesh`, `project-extension`: VWR-390 to 393, 51) | 10 | 04:54 to 06:38 | 6 |
| platform (`scripts`, `third-party-notices`: VSS-471, PLT-194) | 4 | 04:58 to 06:45 | 2 |

**Rule 23 held for the one lane that had work** (20.6 an hour, as SP5 and SP6); the gcode and viewer
lanes ran out of workable cards (gcode after 06:50, viewer after 06:38). Whether any SP8 card was workable
when they emptied was not checked here (GCP-50 depends on GCP-49 and GCP-30; not verified).
Rule 10's formula, 131.1 minutes x 1.89 agents / 1.75, gives 142 points against 75: SP7 spent 3.3
agent-minutes a point, because two Opus catalogue cards (PRF-16, PRF-18) took 54 of 248 minutes and 19
Opus reviews took 75.

By effort, model and type (agent time from the events):

- **XS** (PRF-135): the coordinator's release, no agent.
- **S**: Sonnet workers 0.7 to 5.8 per agent of one to three cards (module creation PRF-119 to 121 2.3,
  PRF-118 0.8; PRF-178+122 5.8); Opus PRF-21 spike 6.9, PRF-179 6.2.
- **M**: Sonnet 2.8 to 6.6 (PRF-41 2.8, VWR-51 4.2, GCP-39 6.6 with GCP-113, PRF-20 6.5); Opus PRF-17
  9.0 plus a 3.9 fix, PRF-123 4.7, **PRF-18 23.1** plus a 2.1 fix.
- **L**: **PRF-16 30.7** plus an **11.2** fix (Opus); GCP-36 6.1 plus a 4.7 fix (Sonnet).
- **By type**: bugs 8 of 8 done, **0 failed review** (as SP6); new code and chores 23 done, **8 failed
  first review**.

## Why

- *Long agents held two waves.* **PRF-16** (L, Opus: about 1,540 PrusaSlicer 2.9, 3.0 and SuperSlicer
  keys, generated from upstream C++) ran 30.7 minutes in a message with four workers and three reviews
  (median 6.1); SP6's re-sizing note had flagged it as a long agent. Its fix ran 11.2 and its first review
  9.4, so the card took 57 agent-minutes over three waves. **PRF-18** (M, Opus: groups, homes, hidden keys
  and override scopes over all four slicers' keys) ran 23.1 with four short agents; nobody expected it to
  be long (M). Together waves 3 and 7 hold 253 of the 393 waiting agent-minutes and 54 of the 131
  minutes of sprint.
- *Fix rounds* (coordinator; confirmed by the move events): 8 cards failed first review, 9 fix agents
  (PLT-194 two rounds). Wall from the failed review's move to done:

  | Card | Failed review | Done | Wall | Rounds | Finding (coordinator) |
  |---|---|---|---|---|---|
  | GCP-36 | 05:44:28 | 06:12:03 | 27.6 | 1 | rule 25: thumbnails inflated before the cap and copied to the host; unbounded plate loads (GCP-114 split out) |
  | PRF-17 | 05:45:26 | 06:07:58 | 22.5 | 1 | rule 25: quadratic line lookup |
  | PRF-16 | 05:49:32 | 06:10:00 | 20.5 | 1 | rule 25: quadratic and unbounded C++ tokenizer paths; D9 mappings |
  | PLT-194 | 05:54:09 | 06:44:47 | 50.6 | 2 | substring licence match, then BSD-2/3 |
  | PRF-104 | 05:55:02 | 06:19:54 | 24.9 | 1 | `__proto__` keys, empty ids |
  | PRF-41 | 06:18:28 | 06:44:47 | 26.3 | 1 | dataRoot URL path |
  | GCP-39 | 06:40:40 | 06:49:40 | 9.0 | 1 | rule 25: unbounded request flood |
  | PRF-18 | 06:41:25 | 06:48:34 | 7.2 | 1 | missed SuperSlicer filament overrides |

  **8 of 31 done cards (1 in 3.9) failed first review**: worse than rule 19's 1 in 5; all new code or
  chores, bugs 0 of 8. Wall per failed card 7.2 to 50.6, median 23.7 (rule 19 budgets 15). **Four were
  resource bounds on hostile input** (PRF-16, PRF-17, GCP-36, GCP-39) although bounds were written into
  the criteria before start (coordinator): the findings were in paths the criteria did not name, a
  generator's tokenizer and line lookup (PRF-16, 17), a copy across the host and webview boundary
  (GCP-36), and concurrent requests (GCP-39). Rule 25's test (at most one) failed.
- *Releases and the ci* (coordinator; the log confirms the versions): webview-kit 0.7.0 (`e5b0eb8`), 3mf
  0.1.1 and gcode-parser 0.14.0 (`0278157`), gcode-preview 0.5.0 (`7b9ec46`), tooling 0.9.0 (`e5ef902`)
  re-versioned as 0.8.3 with test-webview 0.2.2 (`03873c5`), profile-api 0.1.0 (`862368d`). **Rule 13
  broke:** a minor of `tooling` (0.9.0) left every module's `^0.8` range unsatisfied, which the clean
  registry's lockfile integrity check caught (run 2); re-versioning as a patch fixed it. One version per
  module held except tooling. Clean-registry ci: run 1 failed on a CHANGELOG the coordinator wrote
  unformatted, run 2 on lockfile integrity, run 3 on version-check (uncommitted 0.0.0 changes), **run 4
  on check-licence** (two findings above). SP6's third run failed on the same "Ported from" rule:
  `node scripts/run.mjs checks` was not run before review in either sprint.
- *Board and prompt slips* (coordinator; not in the events except where noted). The PRF-16 worker
  messaged the main session directly instead of reporting; fix workers twice overwrote the reviewer's
  FAIL text in Progress; VSS-471 was created on the VSS board because `board.py` needs `--board` for
  project boards; PRF-41's 31 MB data went in under `* text=auto eol=lf` and was re-added as `-text`
  (`dfd977a`) so its hash test holds. Rule 22's target of zero was missed again (four).
- *Machine load* (coordinator): load reached about 76 and wall-clock tests flaked: the 3mf fan-out (1 s),
  gcode-parser (500 ms) and a profile-api 5 s timeout. PRF-178 had made the regex timing tests
  load-independent in this same sprint; the other modules still assert wall time.
- *Node* (coordinator): every run used Node v26.12.1 (Homebrew); the project targets Node 24 and no
  Node 24 is installed. SP7's results are unverified on Node 24.
- *Pull-ins and new work* (coordinator; the update and create events show them): PRF-119 to 123, 104,
  83, 118, 21, 22, 41 and VWR-51 from SP8 and SP9; VSS-471, PLT-194 (from GCP-36's notices failure) and
  GCP-114 (from GCP-36's review) created; PRF-57 moved back to SP8 (needs released `profiles-*` modules).
  The stray 0.0.0 mesh and profile-api versions could not be unpublished (E401); the clean-registry runs
  start from empty storage, old storage kept in `/private/tmp/claude-501/sp7reg*`.

## Change

In `.ai/plans/estimation.md`: rules 13, 17, 19, 22 and 25 amended, rule 26 added, "Current calibration"
updated, each with its evidence. Rule 11 stands (15.9%, 0.9 over: the five gaps over 2 minutes are the
lever, not the method).

- **Rule 13 amended:** a `tooling` change ships as a patch unless it breaks consumers' config; a minor
  re-ranges every module and is its own card. Testable: one published tooling version per sprint.
- **Rule 17 amended:** split any card whose agent is expected over 15 minutes (Opus catalogue or
  generator cards over more than one slicer's keys, Opus L) per slicer or per input before dispatch;
  never put reviews in a message with a long worker. Testable: no agent over 15 minutes in SP8, waiting
  under 150 agent-minutes (SP7 393: PRF-16 30.7, PRF-18 23.1).
- **Rule 19 amended:** SP7 1 in 3.9 failed, median wall 23.7; budget one round per 4 new-code cards and
  25 minutes of wall each; fix workers append under Progress below the reviewer's text.
- **Rule 22 amended:** prompts name the board (`board.py --board <project>`), workers report only in their
  final message, and every worker runs `node scripts/run.mjs checks` (licence, ported-copyright,
  package-license) before moving to review. Testable: the clean-registry ci fails on no check that
  `checks` covers.
- **Rule 25 amended:** bounds cover every loop and copy in the card's code, not only the parser named:
  generators and their tokenizers, data copied across a process or webview boundary, and concurrent
  requests (in-flight cap and coalescing). Testable: at most one resource-bound fix round in SP8 (SP7
  four, SP6 seven).
- **Rule 26 added: tests do not assert wall time.** Assert operation counts, step budgets or a ratio
  between input sizes; a timeout exists only as a hang guard of at least 30 s. Testable: no timing flake
  in SP8's ci runs (SP7 three modules under load ~76).

## Re-sizing

No card was re-sized: no SP8 card is a measuring card (rule 18) or changes a shared module with its
consumers (rule 13). For the SP8 coordinator (not changed here):

- **Split before dispatch (rule 17 as amended):** PRF-33 (L, Opus, PrusaSlicer 3.0 YAML tree) and VWR-55
  (L, Opus, three.js rendering in the webview, likely a browser suite).
- **Bounds to write in, naming generators, copies and concurrency (rule 25):** PRF-24 (Prusa INI bundles
  and user presets), PRF-33 (YAML), PRF-40 and PRF-130 (downloads), VWR-53 (files and meshes through
  workers), VWR-61 (plate thumbnails: GCP-36's finding).
- **Fix first:** the two check-licence findings that failed ci run 4, and PRF-179 when Q20 is answered.

## Addendum (coordinator, after the retro agent stopped)

- Clean-registry ci run 4's two check-licence findings were fixed in `10fe74c` (PRF-16's test regex no longer reads as a "Ported from" line; profiles-data-orca's `license` field is back at the project default until Q20, its NOTICE says the data is AGPL-3.0-only). Run 5 failed on check-fixtures (no PROVENANCE.md in `fixtures/profile-research` and `profile-api/test/fixtures/catalogue-keys`), fixed in the next commit. **Run 6 passed at 07:19** on an empty registry: 15 packages published, 7 modules skipped as unreleased 0.0.0 (mesh, profiles, profiles-prusa/orca/cura, profiles-data-orca, project-extension). Six ci runs for one sprint: every failure was a repo-level check (`run.mjs checks`, lockfile integrity, version-check) that no worker or reviewer ran, which is the evidence for rule 22's new "workers run `node scripts/run.mjs checks`" clause.
- The audit (`.ai/audits/SP7-audit.md`) was read-only within a 14-minute box: no probes or tests; it found one nice-to-have (PRF-180). The SP8 audit should re-run SP6's and SP7's hostile probes.
