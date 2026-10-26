# SP4 retro: Preview 1

Card VSS-78. Written by the retro agent, who wrote none of SP4's code. Sources: `board.py retro SP4`
(below, unedited), the start, stop, dispatch and move events in `.ai/local/taskboard/activity.jsonl`
from 2026-10-25T23:16, the cards' Progress in `.ai/kanban/projects/{gcode,platform}/`, and
`git log dbaad77..HEAD` (`26e6955` to `39a31c1`). Facts the coordinator supplied are marked
"(coordinator)" and were checked against the events where the events can show them.

## SP4 Preview 1: the facts

- Planned: 2026-10-25T23:16+00:00 to 2026-10-26T01:30+00:00, 139 points (62.2 points/hour)
- Actual: last card done 2026-10-26T00:49+00:00, 72 points (46.5 points/hour), -41 minutes after the planned end

| Card | Type | Effort | Points | Model | Started | Done | Minutes | Cost | Title |
|---|---|---|---|---|---|---|---|---|---|
| PLT-187 | bug | S | 2 | sonnet | 23:22 | 00:44 | 83 | $0.40 | Deliver a reloaded webview's reused stream ids |
| PLT-41 | feature | M | 3 | sonnet | 23:22 | 00:44 | 83 | $0.73 | Implement the WebGL2 context factory with structured failure causes |
| GCP-28 | feature | M | 3 | sonnet | 23:22 | 00:44 | 82 | $0.52 | Add the labelled Bambu estimate |
| GCP-86 | bug | S | 2 | sonnet | 23:22 | 00:43 | 82 | $0.46 | Speed up latin1 conversion in the bgcode-to-gcode twin |
| GCP-85 | bug | S | 2 | sonnet | 23:21 | 00:44 | 82 | $0.67 | Guard the Klipper planner against zero accel or velocity |
| GCP-30 | feature | L | 5 | opus | 23:22 | 00:43 | 82 | $6.00 | Register the custom editor and orchestrate parse, plan and transfer |
| GCP-83 | feature | L | 5 | opus | 23:22 | 00:44 | 82 | $3.04 | Carry ESTIMATOR_ADD_TIME and G4 dwell through gcode-api and the parser to the planners |
| PLT-38 | feature | M | 3 | sonnet | 00:07 | 00:49 | 42 | $0.97 | Provide the Playwright webview stub from the kit |
| PLT-188 | bug | S | 2 | sonnet | 00:05 | 00:44 | 39 | $0.59 | Accept host messages in createWindowChannel when window.parent is the window |
| PLT-42 | feature | L | 5 | opus | 00:05 | 00:44 | 39 | $1.95 | Implement data textures with chunking to MAX_TEXTURE_SIZE |
| GCP-84 | feature | M | 3 | sonnet | 00:05 | 00:44 | 39 | $0.74 | Open .bgcode in the parser: same ParsedFile as the .gcode twin, metadata in the golden JSON |
| GCP-27 | feature | M | 3 | sonnet | 00:05 | 00:44 | 39 | $1.39 | Write the RRF planner |
| GCP-82 | feature | S | 2 | sonnet | 00:10 | 00:44 | 34 | $2.04 | Re-segment arcs at Klipper's gcode_arcs resolution |
| PLT-44 | feature | L | 5 | opus | 00:14 | 00:44 | 30 | $3.31 | Implement the instanced segment renderer with range, masks and shader colouring |
| PLT-39 | feature | M | 3 | sonnet | 00:14 | 00:44 | 30 | $1.48 | Integration test: 200 MB host to webview transfer with hash check |
| PLT-43 | feature | M | 3 | sonnet | 00:14 | 00:44 | 30 | $0.89 | Handle webglcontextlost and restored by rebuilding GPU resources |
| GCP-22 | chore | M | 3 | sonnet | 00:14 | 00:44 | 30 | $0.75 | Unit-test each Klipper planner rule |
| GCP-23 | feature | M | 3 | opus | 00:14 | 00:44 | 30 | $3.36 | Spike and build planner checkpoints and trapezoidsFor with a property test |
| PLT-40 | feature | M | 3 | sonnet | 00:26 | 00:44 | 18 | $1.17 | Integration test: webview hide, restore, dispose and CSP console capture |
| PLT-48 | feature | L | 5 | opus | 00:29 | 00:44 | 16 | $2.15 | Draw into a foreign three.js WebGL2 context with state save and restore |
| PLT-47 | feature | M | 3 | sonnet | 00:29 | 00:44 | 16 | $0.38 | Memory test with 15 million synthetic moves |
| PLT-45 | feature | S | 2 | sonnet | 00:29 | 00:44 | 16 | $0.38 | Test that colour and range changes cause no texture or buffer uploads |
| GCP-87 | chore | S | 2 | sonnet | 00:46 | 00:49 | 4 | $0.64 | Move gcode-preview to webview-kit 0.5.0's channel and gcode-planner 0.3.0's plannerFor |
| VSS-43 | chore | S | 2 | opus | - | - | - | - | SP4: audit review and bugfix |
| VSS-78 | chore | S | 2 | opus | - | - | - | - | SP4: retro |
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
| PLT-33 | spike | M | 3 | opus | 23:22 | - | - | $1.69 | Spike: WebGPU probe and workers under the kit CSP |
| PLT-31 | spike | L | 5 | opus | 23:22 | - | - | $5.74 | Spike: postMessage transferables versus fetch(asWebviewUri) for 50 to 500 MB |
| GCP-21 | chore | M | 3 | sonnet | - | - | - | - | Run klipper_estimator as a black-box oracle in CI |
| GCP-25 | chore | M | 3 | sonnet | - | - | - | - | Compare against PrusaSlicer M73 totals and per-layer progress |
| GCP-29 | chore | S | 2 | sonnet | - | - | - | - | Measure three H2C prints against the estimates |
| GCP-79 | chore | M | 3 | sonnet | 00:09 | - | - | $0.69 | Extend the golden corpus to PrusaSlicer, SuperSlicer, Cura and Bambu multi-material |
| GCP-18 | feature | M | 3 | sonnet | 00:14 | - | - | $0.87 | Benchmark memory and throughput on synthetic 50, 200 and 500 MB files in CI |

By effort:

| Effort | Cards | Done | Median minutes | Minutes per point | Cost |
|---|---|---|---|---|---|
| L | 8 | 5 | 39 | 10.0 | $22.18 |
| M | 21 | 11 | 30 | 13.3 | $16.07 |
| S | 18 | 7 | 39 | 24.3 | $5.63 |

By model:

| Model | Cards | Done | Median minutes | Minutes per point | Cost |
|---|---|---|---|---|---|
| opus | 13 | 6 | 39 | 10.0 | $27.23 |
| sonnet | 34 | 17 | 39 | 17.0 | $16.65 |

By type:

| Type | Cards | Done | Median minutes | Minutes per point | Cost |
|---|---|---|---|---|---|
| bug | 5 | 4 | 82 | 35.8 | $2.13 |
| chore | 13 | 2 | 30 | 6.8 | $2.24 |
| feature | 26 | 17 | 34 | 12.0 | $32.08 |
| spike | 3 | 0 | - | - | $7.43 |

## Reading the facts table

**Started** is right this time: it is each card's move to doing, made by the coordinator at dispatch
(rule 16's first half held). **Done** is not: `board.py` takes it from the git commit that brought the
card into `done/` (`_read_done_times`), and every card was committed in one run, `26e6955` at 00:43:30
to `86fb405` at 00:44:47. The reviewers did move each card to done at review time; the move events
give the real done times, 00:06:59 (GCP-28) to 00:49:26 (GCP-87). So the Minutes column (4 to 83) again
measures commit batching, not work. Per card from the move events instead (doing to done, minutes):

| Wave of the card | Cards | Doing to done | Of which waiting in review |
|---|---|---|---|
| 1 (23:22) | GCP-85, GCP-28, GCP-86, PLT-41, PLT-187, GCP-83, GCP-30 | 45.0 to 47.0 | 39.3 to 44.2 (GCP-30 13.6) |
| 2 (00:06) | GCP-27, GCP-84, PLT-188, PLT-42 | 10.7 to 12.2 | 3.9 to 8.3 |
| 3 (00:15) | GCP-22, GCP-23, PLT-44, PLT-39; fix rounds GCP-82, PLT-43 | 16.9 to 29.8 | 6.1 to 27.5 |
| 4 (00:30) | PLT-40, PLT-45, PLT-47, PLT-48 | 10.4 to 12.9 | 2.2 to 8.9 |
| 5 to 8 (00:39 to 00:49) | PLT-38 (harness swap after the kit release), GCP-87 | 41.4, 3.4 | 37.0, 1.3 |

Median time a card sat in review before done: 10.4 minutes; wave 1's six short cards: 43.5.

Agents, from the start and stop events (55 agents; the coordinator's own session excluded):

| Wave start | Agents | Median run (min) | Longest | Last stop | Gap to next wave |
|---|---|---|---|---|---|
| 23:22:46 | 9 | 1.3 | PLT-31 41.6, GCP-30 32.9 | 00:04:33 | 2.1 |
| 00:06:38 | 13 | 2.4 | GCP-27+GCP-82 worker 6.6 | 00:13:30 | 2.0 |
| 00:15:30 | 14 | 1.9 | PLT-39+PLT-40 worker 12.8 | 00:28:34 | 1.4 |
| 00:29:55 | 10 | 2.7 | PLT-48 8.6 | 00:38:49 | 0.6 |
| 00:39:25 | 4 | 1.8 | PLT-45/47 review 2.6 | 00:42:04 | 0.3 |
| 00:42:20 | 1 | 0.6 | PLT-43 re-review | 00:42:58 | 3.4 |
| 00:46:20 | 2 | 2.2 | GCP-87 worker 2.1 | 00:48:29 | 0.4 |
| 00:48:53 | 2 | 0.7 | GCP-87 review | 00:49:32 | - |

This confirms the coordinator's waves (9, 13, 14, 10, 4, 1, 2, 2). The coordinator's wave times
(00:05, 00:14, 00:29) are its moves to doing; the agents started 1 minute later. The sixth wave
started at 00:42:20, not 00:44.

From 23:16 to 00:53 (97 minutes): **227 agent-minutes**, mean **2.34 running agents** (SP3 2.0), peak
14. No agent ran for 20.3 minutes (21%; SP3 37%): 6.8 before wave 1 (setup, Q14, moving GCP-15/16),
3.4 after 00:49:32 (release and clean-registry ci), about 10 between waves. One agent ran for 15.2
minutes and two for 30.8: from 23:30 to 00:04, only GCP-30 and then PLT-31 were running. Finished
agents' results waited for their wave's last agent for 594 agent-minutes in all, 301 of them in wave 1.

Agent-minutes: Opus workers 122.2, Opus reviews 30.9, Sonnet workers 56.9, Sonnet reviews 16.9. Opus
work on done cards was 73.9 minutes for 28 points (2.6 a point), plus 48.2 minutes on the PLT-31 and
PLT-33 spikes, which are not done. Sonnet work was about 1.3 a point. All agents: 3.2 agent-minutes
per done point (SP3 1.5); 2.6 if the 14 points of partial cards are counted.

## On time or not

**Early, and out of work.** The last card was done at 00:49 and the clean-registry ci exited 0 at 00:52
(`39a31c1`), 38 minutes before the planned end of 01:30.

| | Points |
|---|---|
| Assigned (facts table) | 139 |
| Owner-blocked: PLT-1, 7, 9, 10, 16, 18, 19, 24 to 29, 181 (Q7, Q8, Q12) | 38 |
| Owner-blocked: GCP-29 (hardware), GCP-21 (Q14) | 5 |
| Dependency-blocked: GCP-25 (on GCP-79), PLT-46 (on PLT-18, Q7) | 6 |
| Audit and retro cards | 4 |
| Workable | 86 (82 planned, plus PLT-188 and GCP-87 created in the sprint) |
| Sprint capacity (SP4 doc) | 92 |
| Done | **72** (84% of workable) |
| Partial, carried for owner input: PLT-31 (Q16), PLT-33 (Q15), GCP-79 (owner exports), GCP-18 (Q7) | 14 |

Every workable card was done or taken as far as it could go without the owner. **Velocity: 72 points
in 93 minutes, 46.5 points an hour** (72 in 97 minutes to the end of ci: 44.5). That is the 46 an hour
the plan used for SP4 (92 for 2 hours); it does not differ. It is a floor, not a ceiling: the sprint
ran out of workable cards, and for 34 minutes (23:30 to 00:04) only one or two agents ran while seven finished
cards waited (see Why). Rule 10's formula (97 x 2.34 / 1.5 = 151 points) over-states what was done by
two times, because SP4's agent-minutes per point doubled.

By effort, model and type (agent time, not the table's Minutes):

- **L ran 6 to 11 agent-minutes**: GCP-83 7.1, PLT-42 6.3, PLT-44 8.4, PLT-48 8.6, GCP-23 (M, Opus)
  10.6. **GCP-30 ran 32.9**, three to five times an L: it created the new `gcode-preview` module, ran
  its VS Code integration tests on 1.100.0 and stable, and found the window-channel bug (PLT-188).
  The **PLT-31 spike (L) ran 41.6** and is still partial: 10 transport methods at 3 sizes, 3 runs each,
  on one OS.
- **M and S Sonnet cards ran about 1 to 3 minutes each**, and lanes that took two in sequence 4 to 13
  (PLT-39 then PLT-40, 12.8). S bug cards (GCP-85, GCP-86, PLT-187, PLT-188) took 0.9 to 1.3.
- **By type**: bugs passed review 4 of 4; new code failed it 3 times in 20 (GCP-82, PLT-31, PLT-43),
  against 7 in 13 in SP3; reviewers fixed six smaller findings in place (coordinator: PLT-41
  `.gitignore` and comment, GCP-27 fallback feedrate 25 to 50 mm/s, PLT-44 attribution, PLT-39/40
  SPDX banner, GCP-82 re-review CHANGELOG, PLT-43 re-review docs). Spikes: 0 of 2 done, both for
  other-OS runs only the owner can do.
- **By model**: Opus carried $27.23 for 6 done cards plus the two spikes; Sonnet $16.65 for 17.

## Why

- *The dispatch barrier* (coordinator; confirmed by the events). In this harness the Agent calls sent
  in one message returned only when every agent in it had stopped, so the coordinator could not follow
  rule 11. Wave 1 mixed seven short agents (median 1.3 minutes) with GCP-30 (32.9) and PLT-31 (41.6):
  the Sonnet workers stopped at 23:24, their reviews started at 00:06:38, and wave 1's cards were done
  45 to 47 minutes after dispatch for 1 to 7 minutes of work. That one barrier cost about 36 minutes of
  sprint time. Later waves had no agent over 13 minutes and turned over in 9 to 13 minutes. The
  coordinator's mitigations worked: two cards in sequence per lane agent (GCP-27 then GCP-82, GCP-84
  then GCP-79, PLT-188 then PLT-38, PLT-39 then PLT-40, PLT-45 then PLT-47), and dependents started
  before their dependency's review (PLT-44 and PLT-43 in wave 3, with PLT-42's review in the same wave).
- *Out of work, not out of capacity.* After 00:30 the board had only the PLT-38 harness swap, GCP-87
  and reviews; everything else was owner-blocked, dependency-blocked, or in SP7. The four partial cards
  (14 points) stopped on owner input that their acceptance criteria named at planning: other OSes
  (PLT-31, PLT-33), slicer exports (GCP-79), the CI step that waits on Q7 (GCP-18). Rule 6 says to plan
  those parts as their own cards; SP4 did not.
- *Long cards.* GCP-30 and PLT-31 are the two cards far over their size. GCP-30 was a new module plus
  VS Code integration on two versions plus orchestration across three modules; PLT-31 a measuring spike
  whose runs take wall time on any model. Both found PLT-188 (the window channel dropped every host
  message), which was created at 00:05 and done by 00:16.
- *Fix rounds* (coordinator; confirmed by the move events). GCP-82 (duplicated circle fit; failed
  00:16:45, done 00:40:45), PLT-31 (wording beyond the data; 00:08:31 to 00:30:45), PLT-43 (stale free
  after restore; 00:30:44 to 00:42:50). Each fix took 0.6 to 1.6 agent-minutes and its re-review 0.6 to
  1.5, but cost 12 to 24 minutes of wall time because each waited for two wave barriers. Fixing small
  findings in place kept six more cards out of fix rounds. GCP-27's in-place fix changed behaviour (the
  fallback feedrate) rather than wording: that is the edge of what a reviewer should change alone.
- *Commit granularity* (coordinator; the log confirms it). Parallel cards in one module (rule 14) all
  edited the module's CHANGELOG, README, `index.ts`, `package.json` and lockfile, and some edited each
  other's code: PLT-39 changed PLT-187's `transfer.ts` and PLT-188's `webview-window.ts`, GCP-27 edited
  GCP-28's `bambu.ts`, and GCP-83, GCP-23 and GCP-82 all edited `klipper.ts`. Nothing was committed
  between cards, so the coordinator split the working tree by file after all reviews: 22 commits in
  77 seconds (00:43:30 to 00:44:47), each shared file in the last card's commit with an "also carries"
  note (`709296f`, `599f85d`, `4c7506c`, `3342049`, `35f76f9`, `978564d`); `e6c6583` (PLT-187) holds
  only its card file and GCP-28's `bambu.ts` landed in GCP-27's `4c7506c`. A reader cannot tell from
  one commit what a card changed, and `board.py retro` reads all done times as 00:43 to 00:44.
- *Release ripple* (coordinator; the log confirms the versions). Workers published as they went:
  gcode-api 0.5.0 and gcode-parser 0.9.0 (GCP-83, 23:29), gcode-preview 0.1.0 (GCP-30), gcode-parser
  0.10.0 (GCP-84). GCP-79 and GCP-18 then changed gcode-parser's `package.json`, so the clean-registry
  ci failed lockfile integrity once; gcode-parser 0.10.1 and gcode-preview 0.2.1 fixed it, and
  `run.mjs ci` from an empty registry exited 0 at 00:52 (`39a31c1`). gcode-parser shipped three
  versions in one sprint, against rule 13's one.
- *Stray files* (coordinator; not in the events). Two reviewers' shell mistakes created files named
  after `ls` output in a board folder (`ls` is aliased to long output, as SP3 noted); one reviewer
  deleted another's note, which the coordinator restored; a reviewer ran `rm -rf /tmp/x` on a directory
  it did not create; the GCP-82 fix worker overwrote its card and rebuilt it. Four incidents in 55
  agents; no work was lost because the coordinator caught each.
- *Work created in the sprint* (coordinator; the create events confirm the cards). PLT-188 (00:05,
  from PLT-31 and GCP-30) and GCP-87 (00:46, the gcode-preview follow-up to webview-kit 0.5.0 and
  gcode-planner 0.3.0). Owner questions Q14 (GCP-21's oracle build, 23:21), Q15 (PLT-33, 23:27) and Q16
  (PLT-31, 23:51). GCP-15 and GCP-16 moved to SP7 behind VWR-73 (SP6).

## Change

Rules 17 to 22 added to `.ai/plans/estimation.md` "Rules learned", each with its evidence:

17. When Agent calls in one message return together, no message mixes agents expected to run over
    10 minutes with short ones: long cards (Opus spikes, new-module L) go out alone or in the last
    message; lane agents take two short cards in sequence. Testable: median time from a worker's stop
    to its review's start under 10 minutes (SP4 wave 1: 43).
18. A card that creates a new module with VS Code integration tests, or a spike that measures with
    repeated runs, is XL or is split into build and measure; and each OS a spike must run on, other
    than the coordinator's, is its own owner-blocked card at planning.
19. Reviewers fix in place only what changes no behaviour (docs, comments, attribution, licence
    headers, CHANGELOG, ignore files) and say so in Progress; a behaviour change is a fix round.
    Budget one fix round per 6 new-code cards, about 15 minutes of wall each under wave dispatch.
20. Commit each card when its review passes, before another card that touches its files is
    dispatched; cards in one module that run at the same time leave CHANGELOG, README, `index.ts`,
    `package.json` and the lockfile to the coordinator's release commit. Testable: each card's
    `board.py retro` Done is within 5 minutes of its reviewer's move to done.
21. Workers never publish. The coordinator publishes each module once, after the last card that
    changes it in the sprint passes review, then runs the clean-registry ci. Testable: one version per
    module per sprint in the git log (SP4: gcode-parser 0.9.0, 0.10.0, 0.10.1).
22. Every agent prompt names a `mktemp -d` scratch directory; agents delete only files they created
    there, and use `command ls -1` in scripts. The coordinator runs `git status --short` after each
    wave and restores any change outside the dispatched cards' files. Testable: zero stray-file
    incidents in the next retro (SP4: four).

"Current calibration" now says 46 points an hour, measured (it was the planning figure), and that
rule 10's formula over-states it when Opus spikes and barriers dominate.

## Re-sizing

With `board.py set` (`--agent sp4-retro`), owner-facing scope unchanged:

- **PLT-31** L to **S** and **PLT-33** M to **S**: the probes, macOS runs, reports and proposed
  decisions are done; what is left is recording the owner's Windows and Linux runs (Q15, Q16) and filing
  the decisions (rule 6).
- **GCP-18** M to **S**: the benchmark, budget and measurements are done; only the CI step is left,
  and it waits on Q7.
- **GCP-79** M to **S**: criterion 5 is done; criteria 1 to 4 are adding four owner-supplied exports
  with `pnpm golden:update`, the step GCP-79 already did for one file.
- **GCP-31** (Port the instanced segment renderer to WebGL2, SP5) L to **M**: PLT-42 and PLT-44
  built the libvgcode-style instanced renderer, chunked data textures and range and mask uniforms in
  `webview-kit`; GCP-31 now wires that into `gcode-preview` and renders the corpus. It is a plain
  extension, so rule 8 also points to Sonnet; the model is left to the SP5 planner.
- **GCP-32** (Add colour modes with a palette texture, SP5) L to **M**: PLT-44 has the palette texture
  and four of the eight modes (feature, speed, tool, layer time) and PLT-45 the no-upload spy; width,
  flow, fan and temperature are left.

For the SP5 planner (not changed here): GCP-36 depends on GCP-16, now in SP7, and GCP-41 on GCP-18,
which waits on Q7, so GCP-36, GCP-39, GCP-41 and GCP-42 (14 points) are dependency-blocked in SP5
(rule 7). The chain GCP-31, 32, 35, 38, 55, 56 is 25 points at 3.5 minutes a point plus 5 per card,
about 118 minutes, over rule 5's 72 for a 2-hour sprint even after the re-sizing (about 104). GCP-34's
CI criterion waits on Q7 like PLT-46.
