# SP3 retro: Preview 2

Card VSS-77. Written by the retro agent, who wrote none of SP3's code. Sources: `board.py retro SP3`
(below, unedited), the start, stop, dispatch, move and note events in
`.ai/local/taskboard/activity.jsonl`, the cards' Progress and `git log 38e4938..HEAD` (`332fe0c` to
`95c8008`).

## SP3 Preview 2: the facts

- Planned: 2026-10-25T22:19+00:00 to 2026-10-25T23:15+00:00, 182 points (195.0 points/hour)
- Actual: last card done 2026-10-25T23:05+00:00, 62 points (80.9 points/hour), -10 minutes after the planned end

| Card | Type | Effort | Points | Model | Started | Done | Minutes | Cost | Title |
|---|---|---|---|---|---|---|---|---|---|
| PLT-179 | bug | S | 2 | sonnet | 22:24 | 23:05 | 41 | $0.48 | Make a clean registry rebuild the repo: pin every lockfile to current @vsslicer versions |
| PLT-182 | bug | S | 2 | sonnet | 22:24 | 23:05 | 41 | $0.28 | Run test:integration in CI and drop the dead caches |
| PLT-183 | bug | S | 2 | sonnet | 22:24 | 23:05 | 41 | $0.45 | Print one-line errors from third-party-notices and vsslicer-bundle |
| PLT-184 | bug | S | 2 | sonnet | 22:24 | 23:05 | 41 | - | Write the bundle metafile relative to the bundle cwd |
| PLT-30 | feature | S | 2 | sonnet | 22:24 | 23:05 | 41 | $0.64 | Create the webview-kit package with host, webview and gl entry points |
| GCP-80 | bug | S | 2 | sonnet | 22:24 | 23:05 | 41 | $0.15 | Make the 100 MB summary test and the worker corpus test robust under load |
| GCP-81 | bug | S | 2 | sonnet | 22:24 | 23:05 | 41 | $0.15 | Fill holes in the summary extruders array |
| GCP-19 | feature | L | 5 | opus | 22:24 | 23:05 | 41 | $3.66 | Define planner interface, MachineLimits, Timing output and checkpoints |
| PRN-1 | spike | M | 3 | opus | 22:24 | 23:05 | 41 | $2.71 | Spike: identify the open-source Bambu networking implementation |
| PLT-180 | bug | S | 2 | sonnet | 22:34 | 23:05 | 31 | $1.06 | Add a prepack build to every module that ships dist |
| PLT-185 | bug | S | 2 | sonnet | 22:34 | 23:05 | 31 | - | Retry the lockfile-integrity registry fetch |
| PLT-186 | bug | S | 2 | sonnet | 22:34 | 23:05 | 31 | - | Build the test-vscode runner path with fileURLToPath |
| PLT-32 | feature | S | 2 | sonnet | 22:34 | 23:05 | 31 | $1.10 | Implement createWebviewHtml and the CSP helper |
| PLT-34 | feature | M | 3 | opus | 22:34 | 23:05 | 31 | - | Define the transport protocol: envelope, handshake, schema version |
| GCP-20 | feature | L | 5 | opus | 22:34 | 23:05 | 31 | $1.57 | Port the Klipper planner |
| GCP-24 | feature | L | 5 | opus | 22:34 | 23:05 | 31 | $3.20 | Port the Marlin 2 and Prusa Buddy planner |
| GCP-26 | spike | S | 2 | opus | 22:34 | 23:05 | 31 | $2.08 | Spike: RRF lookahead and arc segmentation in the RRF 3.6 source |
| PLT-35 | feature | L | 5 | opus | 22:44 | 23:05 | 20 | $1.10 | Implement chunking, ordering, backpressure and timeouts over a channel interface |
| GCP-14 | feature | M | 3 | sonnet | 22:44 | 23:05 | 20 | $0.73 | Decode .bgcode to its .gcode twin and expose metadata blocks |
| PLT-36 | feature | M | 3 | sonnet | 22:51 | 23:05 | 13 | $0.26 | Implement the host half of the transport with dropped-message handling |
| PLT-37 | feature | M | 3 | sonnet | 22:51 | 23:05 | 13 | $0.26 | Implement the webview half: acquireVsCodeApi wrapper, state and theme tokens |
| GCP-17 | spike | M | 3 | opus | 22:51 | 23:05 | 13 | $0.85 | Spike: moves per byte with arc fitting |
| VSS-42 | chore | S | 2 | opus | - | - | - | - | SP3: audit review and bugfix |
| VSS-77 | chore | S | 2 | opus | - | - | - | - | SP3: retro |
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
| PLT-31 | spike | L | 5 | opus | - | - | - | - | Spike: postMessage transferables versus fetch(asWebviewUri) for 50 to 500 MB |
| PLT-33 | spike | M | 3 | opus | - | - | - | - | Spike: WebGPU probe and workers under the kit CSP |
| PLT-38 | feature | M | 3 | sonnet | - | - | - | - | Provide the Playwright webview stub from the kit |
| PLT-39 | feature | M | 3 | sonnet | - | - | - | - | Integration test: 200 MB host to webview transfer with hash check |
| PLT-40 | feature | M | 3 | sonnet | - | - | - | - | Integration test: webview hide, restore, dispose and CSP console capture |
| PLT-41 | feature | M | 3 | sonnet | - | - | - | - | Implement the WebGL2 context factory with structured failure causes |
| PLT-42 | feature | L | 5 | opus | - | - | - | - | Implement data textures with chunking to MAX_TEXTURE_SIZE |
| PLT-43 | feature | M | 3 | sonnet | - | - | - | - | Handle webglcontextlost and restored by rebuilding GPU resources |
| PLT-44 | feature | L | 5 | opus | - | - | - | - | Implement the instanced segment renderer with range, masks and shader colouring |
| PLT-45 | feature | S | 2 | sonnet | - | - | - | - | Test that colour and range changes cause no texture or buffer uploads |
| PLT-46 | feature | M | 3 | sonnet | - | - | - | - | Snapshot tests for colour modes, themes and ranges |
| PLT-47 | feature | M | 3 | sonnet | - | - | - | - | Memory test with 15 million synthetic moves |
| PLT-48 | feature | L | 5 | opus | - | - | - | - | Draw into a foreign three.js WebGL2 context with state save and restore |
| PLT-181 | bug | S | 2 | sonnet | - | - | - | - | Reconcile the DCO requirement with the project commit convention |
| PLT-1 | chore | S | 2 | sonnet | 19:17 | - | - | $0.16 | Create the public GitHub repository and protect main |
| PLT-9 | feature | M | 3 | sonnet | 20:25 | - | - | $0.44 | Add the CI workflow: one job per changed module on three operating systems |
| PLT-10 | feature | S | 2 | sonnet | 21:21 | - | - | $0.28 | Enforce DCO sign-off in CI |
| GCP-15 | feature | M | 3 | sonnet | - | - | - | - | Write the read-only zip entry reader |
| GCP-16 | feature | M | 3 | sonnet | - | - | - | - | Open .gcode.3mf plates with statistics, thumbnails and MD5 check |
| GCP-18 | feature | M | 3 | sonnet | - | - | - | - | Benchmark memory and throughput on synthetic 50, 200 and 500 MB files in CI |
| GCP-21 | chore | M | 3 | sonnet | - | - | - | - | Run klipper_estimator as a black-box oracle in CI |
| GCP-22 | chore | M | 3 | sonnet | - | - | - | - | Unit-test each Klipper planner rule |
| GCP-23 | feature | M | 3 | opus | - | - | - | - | Spike and build planner checkpoints and trapezoidsFor with a property test |
| GCP-25 | chore | M | 3 | sonnet | - | - | - | - | Compare against PrusaSlicer M73 totals and per-layer progress |
| GCP-27 | feature | M | 3 | sonnet | - | - | - | - | Write the RRF planner |
| GCP-28 | feature | M | 3 | sonnet | - | - | - | - | Add the labelled Bambu estimate |
| GCP-29 | chore | S | 2 | sonnet | - | - | - | - | Measure three H2C prints against the estimates |
| GCP-37 | feature | M | 3 | opus | - | - | - | - | Interpolate the toolhead position inside a move from the trapezoid |

By effort:

| Effort | Cards | Done | Median minutes | Minutes per point | Cost |
|---|---|---|---|---|---|
| L | 10 | 4 | 31 | 6.2 | $9.52 |
| M | 28 | 6 | 20 | 7.3 | $5.25 |
| S | 24 | 12 | 41 | 18.4 | $6.83 |

By model:

| Model | Cards | Done | Median minutes | Minutes per point | Cost |
|---|---|---|---|---|---|
| opus | 20 | 8 | 31 | 7.7 | $15.17 |
| sonnet | 42 | 14 | 41 | 14.7 | $6.44 |

By type:

| Type | Cards | Done | Median minutes | Minutes per point | Cost |
|---|---|---|---|---|---|
| bug | 10 | 9 | 41 | 18.8 | $2.56 |
| chore | 11 | 0 | - | - | $0.16 |
| feature | 35 | 10 | 31 | 7.6 | $13.23 |
| spike | 6 | 3 | 31 | 10.6 | $5.64 |

## The facts table is wrong again

Rule 9 was not followed. **Started** is the wave commit time (22:24, 22:34, 22:44, 22:51) and **Done**
is 23:05 for every card: the coordinator moved all 22 done cards between 23:04:15 and 23:04:17. The
Minutes column (13 to 41) measures neither work nor wall time. The sprint-level figures are right:
**22 cards and 62 points done**, code final at 23:05 (`95c8008`). Measured from the agent events instead:

| Wave | Dispatched | Agents (workers, reviews, fixes) | Last stop |
|---|---|---|---|
| 1 | 22:25:30 | PLT-179, GCP-80/81, PLT-183/184, PLT-30, GCP-19, PRN-1, PLT-182 (7) | 22:33:08 |
| 2 | 22:35:28 | 3 reviews of wave 1; PLT-180/185/186, PLT-32/34, GCP-20, GCP-24, GCP-26 (8) | 22:44:04 |
| 3 | 22:45:42 | fixes GCP-19, PLT-183, PRN-1; PLT-35, GCP-14; 2 reviews (7) | 22:50:59 |
| 4 | 22:52:21 | fix GCP-24; PLT-36/37, GCP-17; review; PRN-1 re-review (5) | 22:55:47 |
| 5 | 22:56:41 | fixes PLT-35, GCP-14; review (3) | 22:59:59 |
| 6 | 23:00:26 | fix PLT-36/37 (1) | 23:01:30 |

Coordinator from 23:01:30 to 23:05: tooling 0.8.2, the lockfile-only re-lock of 10 modules and a
clean-registry `run.mjs ci` (exit 0 in 70 s, `facfcf0`). 31 agents ran 95 agent-minutes in all:
**1.5 agent-minutes per point** (SP2: 2.4). Mean running agents 2.0 from 22:19 to 23:06 (SP2: 1.34), peak 8.
No agent ran for 17.5 of those 47 minutes (37%).

Worker plus fix agent-minutes per card: L GCP-19 11.9, GCP-24 10.8, GCP-20 5.3, PLT-35 4.4; M PRN-1 7.4,
PLT-32/34 together 4.6, GCP-14 3.1, GCP-17 2.8, PLT-36/37 together 2.4; S bug cards 0.8 to 3.1 (often
two or three to an agent). The relative sizes hold: L runs 2 to 4 times an M.

## On time or not

**On time, but at a third of the assignment.** The code was final at 23:05, 10 minutes before the
planned end; the audit and the retro run after it, so the close is later than 23:15. Against the plan:

| | Points |
|---|---|
| Assigned (all 60 project cards plus audit and retro) | 182 |
| Owner-blocked: PLT-1, 9, 10, 16, 18, 19 (Q7); PLT-7, 24 to 29 (Q8); PLT-181 (Q12); GCP-29 (hardware) | 40 |
| Dependency-blocked outside the sprint: GCP-15, GCP-16 (VWR-73, SP5); GCP-25 (GCP-79) | 9 |
| Audit and retro cards | 4 |
| Workable | 129 |
| Sprint doc's stated capacity | 122 |
| Done | 62 (48% of workable) |
| Not started for capacity or dependencies: GCP-18, 21, 22, 23, 27, 28, 37 (21); PLT-31, 33, 38 to 48 (46) | 67 |

Pace was **81 points an hour** of code time (62 in 46 minutes), 2.4 times SP2's 33. Rule 1 under-said
capacity; the sprint doc over-said it by assigning everything, carried cards included, against rule 6.

By effort, model and type (agent time, not the table): no card ran far from its size. The Opus cards
(GCP-19, GCP-20, GCP-24, GCP-26, GCP-17, PRN-1, PLT-34, PLT-35) cost $15.17 for 8 cards against $6.44 for
14 Sonnet cards (several Sonnet costs missing), and they carried most of the review failures: they were
the new code. Bug cards were cheap and passed review 8 times in 9.

## Why

Where the time went:

- *Wave barriers.* The coordinator dispatched in waves and waited for a wave's slowest agent before the
  next. Wave 1's Sonnet workers were done by 22:28, but wave 2 started at 22:35, after GCP-19 (Opus,
  7.5 min) and the commits. Gaps with nothing running: 22:19 to 22:25 (setup, Q12, re-dependencies),
  22:33 to 22:35, 22:44 to 22:46, 22:51 to 22:52, 22:56 to 22:57, 23:01 to 23:06 (release and re-lock).
- *One long lane.* PLT-30 to PLT-48 are all `webview-kit`, mostly a chain: PLT-30, then 32/34, 35,
  36/37, then 38 to 48. That lane ran four waves for 18 points (about 30 points an hour) and its 46
  remaining points could not start. The `gcode-planner` cards GCP-21, 22, 27, 28, 37 wait on planners
  that were done at 22:54 (GCP-24's fix) or on GCP-23.
- *Review failures.* 8 of 22 failed first review (36%, SP2 14%): GCP-19 (limit precedence contract),
  PLT-183 (esbuild warnings dropped), PRN-1 (D16 ToS framing, missing candidates), GCP-24 (lookahead
  depth: `planner.h:917`), PLT-35 (late duplicate chunk reopens a stream), GCP-14 (last line without
  newline dropped), PLT-36 and PLT-37 (one fix round). PLT-180 also had stale pins after gcode-api
  0.4.1, fixed by the coordinator's re-lock rather than a fix round. Each fix took 0.4 to 4.4
  agent-minutes but waited for the next wave, so it cost about 5 minutes of wall time.
- *Version ripple.* Under PLT-179's stale-pin check, every release of `tooling` or `gcode-api` makes
  each dependent's lockfile stale. Holding tooling's release to the end and re-locking all 10 modules
  once (`pnpm update --no-save`) worked: one clean-registry ci, 70 s.
- *Scope found at review.* GCP-20 needed arc resolution and ESTIMATOR_ADD_TIME that the parser does
  not carry, and GCP-14's parser half was missing; both cards were narrowed and GCP-82, GCP-83 and
  GCP-84 created at 23:04. GCP-19 left worker wiring to GCP-30.
- *What worked.* One agent per module held with 7 to 8 lanes at once. Two planners (GCP-20, GCP-24)
  worked `gcode-planner` in parallel on separate files, neither releasing, and the coordinator released
  once: no conflict.
- *Coordinator overhead.* Committing before review kept lanes moving (commits say "in review"), but
  the done moves were then batched. A worker's unexpanded glob created a stray file named `183-*`
  (since removed), and `ls` is aliased to long output, which costs context on every listing.

## Change

Rules 10 to 16 added to `.ai/plans/estimation.md` "Rules learned", each with its evidence:

10. Capacity = sprint minutes x mean running agents / 1.5 (80 points an hour at SP3's mean of 2),
    replacing rule 1's 33; workable assigned points must not exceed it.
11. Dispatch per lane, not per wave: next card or review within 2 minutes of an agent's stop; idle
    time under 15% of the sprint.
12. Fix-round budget by kind: 1 per 9 bugfix cards, 1 per 2 cards of new code; each costs about 5
    minutes wall.
13. Release `tooling` and `*-api` once per sprint, then one re-lock of all dependents and one
    clean-registry ci (about 5 coordinator minutes); a card that changes a shared module and its
    consumers is at least L, or split.
14. A lane may take two cards at once on disjoint files when neither publishes; the coordinator
    releases once.
15. A port card lists the parser and API inputs it needs; missing ones are their own cards at planning.
16. Move each card to done when its review passes, and to doing when its worker is dispatched
    (restates rule 9, which SP3 broke).

## Re-sizing

- **GCP-83** (Carry ESTIMATOR_ADD_TIME and G4 dwell through gcode-api and the parser to the planners):
  M to **L** by rule 13. It changes the shared `gcode-api` and two consumers (`gcode-parser`,
  `gcode-planner`), so three releases and a re-lock. Splitting it per module is the alternative for the
  SP4 planner.

No other card re-sized. Agent time kept L at 2 to 4 times an M and S bug cards under 3 minutes. The
shortfall came from the lane chain and wave barriers (rules 10, 11), not from card sizes. Two webview
M cards (PLT-36 and PLT-37) ran in 2.4 agent-minutes together, which is not enough evidence to shrink
PLT-38 to PLT-48. For SP4's planner: the `webview-kit` chain (46 points) is one lane, at about 30
points an hour, and must not be planned as parallel capacity (rules 4, 5).
