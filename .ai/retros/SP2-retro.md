# SP2 retro: Preview 1

Card VSS-76. Written by the retro agent, who wrote none of SP2's code. Sources: `board.py retro SP2`
(below, unedited), the agent start, stop and dispatch events in `.ai/local/taskboard/activity.jsonl`,
the cards' Progress, `.reference/notes/<ticket>-*.md` and `git log 62b9723^..HEAD`.

## SP2 Preview 1: the facts

- Planned: 2026-10-25T19:15+00:00 to 2026-10-25T21:15+00:00, 137 points (68.5 points/hour)
- Actual: last card done 2026-10-25T22:10+00:00, 97 points (33.3 points/hour), 55 minutes after the planned end

| Card | Type | Effort | Points | Model | Started | Done | Minutes | Cost | Title |
|---|---|---|---|---|---|---|---|---|---|
| PLT-2 | feature | M | 3 | sonnet | 19:17 | 22:07 | 170 | $1.34 | Scaffold the module layout, the module runner and the local registry |
| PLT-6 | docs | S | 2 | sonnet | 19:31 | 22:07 | 155 | $0.48 | Add LICENSE, package licence fields and the contributor docs skeleton |
| PLT-3 | feature | M | 3 | sonnet | 19:35 | 22:07 | 151 | $1.22 | Add the TypeScript base config and esbuild bundling to the tooling module |
| PLT-8 | feature | S | 2 | sonnet | 19:43 | 22:07 | 144 | $0.62 | Set up vitest for libraries |
| GCP-1 | feature | M | 3 | opus | 19:45 | 22:07 | 142 | $2.65 | Define the @vsslicer/gcode package API and move-buffer layout |
| PLT-4 | feature | S | 2 | sonnet | 19:54 | 22:07 | 132 | $1.17 | Add ESLint and Prettier configuration with SPDX header rule |
| GCP-57 | feature | S | 2 | opus | 19:58 | 22:07 | 128 | $2.66 | Add the modal state-change table to gcode-api |
| GCP-2 | chore | L | 5 | sonnet | 20:09 | 22:10 | 122 | $4.95 | Check in the golden corpus and the golden-JSON harness |
| PLT-5 | feature | S | 2 | sonnet | 20:14 | 22:07 | 113 | $0.53 | Fail the build on phantom dependencies |
| GCP-3 | feature | L | 5 | sonnet | 20:22 | 22:07 | 104 | $3.07 | Implement the streaming text parser core |
| PLT-14 | feature | S | 2 | sonnet | 20:25 | 22:07 | 101 | $0.50 | Create the sample extension and the sample webview fixture |
| PLT-11 | feature | M | 3 | sonnet | 20:26 | 22:07 | 101 | $0.69 | Write tools/check-licence for package fields, SPDX headers and ported-file provenance |
| PLT-13 | feature | S | 2 | sonnet | 20:32 | 22:07 | 94 | $0.55 | Write the fixtures check for size cap and PROVENANCE.md |
| PLT-12 | feature | M | 3 | sonnet | 20:35 | 22:07 | 92 | $1.17 | Write the bundled-dependency licence check and THIRD-PARTY-NOTICES generator |
| PLT-17 | feature | M | 3 | sonnet | 20:37 | 22:07 | 90 | $1.21 | Add the Playwright harness with SwiftShader WebGL and a webview stub loader |
| GCP-4 | feature | M | 3 | sonnet | 20:39 | 22:07 | 88 | $2.69 | Detect slicer and flavour and assign roles and layers from tag sets |
| GCP-11 | feature | L | 5 | sonnet | 20:41 | 22:07 | 85 | $1.81 | Read the .bgcode container: header, blocks, CRC32 and diagnostics |
| PLT-21 | feature | M | 3 | sonnet | 20:52 | 22:07 | 75 | $1.00 | Add the VSIX packaging task with content assertion and size budget |
| PLT-20 | feature | S | 2 | sonnet | 20:53 | 22:07 | 74 | $0.78 | Set up per-module versioning and the release-tag convention |
| GCP-5 | feature | M | 3 | sonnet | 20:56 | 22:07 | 71 | $0.97 | Write the move buffers, layer table and diagnostics with transferable output |
| PLT-22 | feature | S | 2 | sonnet | 20:57 | 22:07 | 69 | $0.61 | Package per-target VSIX for extensions that declare targets |
| PLT-15 | feature | M | 3 | sonnet | 20:58 | 22:07 | 68 | $1.68 | Add the @vscode/test-electron harness |
| PLT-23 | feature | S | 2 | sonnet | 20:59 | 22:07 | 68 | $1.37 | Create the vsslicer extension pack skeleton |
| GCP-12 | feature | M | 3 | sonnet | 21:02 | 22:07 | 64 | $1.15 | Port the Heatshrink 11-4 and 12-4 decoder |
| GCP-6 | feature | M | 3 | sonnet | 21:10 | 22:07 | 56 | $1.31 | Run the parser in a worker with cancel, progress and a memory cap |
| GCP-13 | feature | M | 3 | sonnet | 21:15 | 22:07 | 51 | $1.68 | Port the MeatPack decoder with and without comments |
| GCP-7 | feature | M | 3 | sonnet | 21:28 | 22:07 | 39 | $2.10 | Extract thumbnails, object labels and the config block |
| GCP-8 | feature | M | 3 | sonnet | 21:33 | 22:07 | 34 | $1.37 | Compute per-job filament, weight, cost and the slicer estimate; add readSummary |
| GCP-9 | feature | L | 5 | sonnet | 21:48 | 22:07 | 19 | $1.77 | Tessellate G2/G3 arcs in I/J and R form |
| PLT-178 | bug | S | 2 | sonnet | 21:50 | 22:07 | 17 | $0.48 | Stop a local ci run that would use a stale dependency |
| PLT-177 | bug | XS | 1 | sonnet | 21:50 | 22:07 | 17 | $0.44 | Remove the stray package.json and .vscodeignore at the repository root |
| PLT-176 | bug | S | 2 | sonnet | 21:50 | 22:07 | 17 | $0.68 | Share the VS Code test download across modules |
| GCP-76 | bug | S | 2 | sonnet | 21:50 | 22:07 | 17 | $0.77 | Bound block sizes in the .bgcode reader |
| GCP-77 | bug | XS | 1 | sonnet | 21:55 | 22:07 | 12 | $1.17 | Join chunks without spreading arrays in collect |
| GCP-78 | bug | S | 2 | sonnet | 22:03 | 22:08 | 5 | $0.75 | Reset the toolhead position on G28 |
| GCP-10 | chore | S | 2 | sonnet | 22:07 | 22:10 | 3 | $0.69 | Check arc-fitted fixtures against slicer output |
| VSS-41 | chore | S | 2 | opus | - | - | - | $0.28 | SP2: audit review and bugfix |
| VSS-76 | chore | S | 2 | opus | - | - | - | $0.28 | SP2: retro |
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
| PLT-1 | chore | S | 2 | sonnet | 19:17 | - | - | $0.16 | Create the public GitHub repository and protect main |
| PLT-9 | feature | M | 3 | sonnet | 20:25 | - | - | $0.44 | Add the CI workflow: one job per changed module on three operating systems |
| PLT-10 | feature | S | 2 | sonnet | 21:21 | - | - | $0.28 | Enforce DCO sign-off in CI |

By effort:

| Effort | Cards | Done | Median minutes | Minutes per point | Cost |
|---|---|---|---|---|---|
| L | 6 | 4 | 104 | 16.5 | $11.59 |
| M | 19 | 15 | 75 | 28.7 | $22.68 |
| S | 24 | 15 | 74 | 37.9 | $13.65 |
| XS | 2 | 2 | 17 | 14.5 | $1.61 |

By model:

| Model | Cards | Done | Median minutes | Minutes per point | Cost |
|---|---|---|---|---|---|
| opus | 7 | 2 | 142 | 54.0 | $5.88 |
| sonnet | 44 | 34 | 74 | 27.4 | $43.65 |

By type:

| Type | Cards | Done | Median minutes | Minutes per point | Cost |
|---|---|---|---|---|---|
| bug | 6 | 6 | 17 | 8.5 | $4.29 |
| chore | 9 | 2 | 122 | 17.9 | $6.37 |
| docs | 1 | 1 | 155 | 77.5 | $0.48 |
| feature | 34 | 27 | 88 | 31.1 | $38.38 |
| spike | 1 | 0 | - | - | $0.00 |

## Two faults in the facts table

The facts table above has two measurement faults, so this retro measures from the agent events instead.

- **Done** is 22:07 for almost every card. The commit `ee9667a` (22:07:05, "Board: move project
  boards under .ai/kanban/projects") re-stamped every done card's finish time. The real review
  passes ran from 19:28 (PLT-2) to 22:10 (GCP-10), as the `move review>done` events show.
- **Started** is the card's first move into an active column, and workers often made that move
  as their last step. For example GCP-3's worker ran from 20:14:59 to 20:23:12 and moved the card
  `backlog>doing` at 20:22:49, then `doing>review` 8 seconds later.

So the **Minutes** column (3 to 170) measures neither card work nor wall time. The sprint-level
figures are right: 97 points done, last card done 22:10, 33.3 points an hour.

Measured per card from the agent intervals: the worker is the sum of the worker and fix agents'
start-to-stop times; the review is the sum of the reviewer agents' times; wall runs from the first
agent's start to the last agent's stop.

| Card | Effort | Worker min | Review min | Rounds (work/review) | Wall min | Window |
|---|---|---|---|---|---|---|
| PLT-2 | M | 4.6 | 1.7 | 2/2 | 12.1 | 19:17-19:29 |
| PLT-6 | S | 1.1 | 5.5 | 1/1 | 10.0 | 19:27-19:37 |
| PLT-3 | M | 5.0 | 1.3 | 1/1 | 7.2 | 19:32-19:39 |
| PLT-8 | S | 1.8 | 1.2 | 1/1 | 3.4 | 19:41-19:44 |
| GCP-1 | M | 5.7 | 3.3 | 1/1 | 10.3 | 19:43-19:54 |
| PLT-4 | S | 4.6 | 1.8 | 1/1 | 7.9 | 19:50-19:58 |
| GCP-57 | S | 6.5 | 3.0 | 1/1 | 17.1 | 19:56-20:13 |
| GCP-2 | L | 16.0 | 0.6 | 2/1 | 133.8 | 19:56-22:10 |
| PLT-5 | S | 1.8 | 1.6 | 1/1 | 5.5 | 20:11-20:16 |
| GCP-3 | L | 10.0 | 4.2 | 2/2 | 17.8 | 20:14-20:32 |
| PLT-11 | M | 2.0 | 1.1 | 1/1 | 5.0 | 20:24-20:29 |
| PLT-14 | S | 1.4 | 0.7 | 1/1 | 4.5 | 20:24-20:29 |
| PLT-12 | M | 4.1 | 2.0 | 1/1 | 9.2 | 20:31-20:40 |
| PLT-13 | S | 1.2 | 0.8 | 1/1 | 8.0 | 20:31-20:39 |
| PLT-17 | M | 5.9 | 3.0 | 1/1 | 10.1 | 20:31-20:41 |
| GCP-4 | M | 8.8 | 1.8 | 1/1 | 11.8 | 20:38-20:50 |
| GCP-11 | L | 4.0 | 9.8 | 2/2 | 24.4 | 20:38-21:03 |
| PLT-20 | S | 2.3 | 1.3 | 1/1 | 6.4 | 20:49-20:55 |
| PLT-21 | M | 3.6 | 2.0 | 1/1 | 7.1 | 20:49-20:56 |
| GCP-5 | M | 2.4 | 1.6 | 1/1 | 5.2 | 20:54-20:59 |
| PLT-22 | S | 1.0 | 1.6 | 1/1 | 12.1 | 20:57-21:09 |
| PLT-23 | S | 4.7 | 1.2 | 2/1 | 20.3 | 20:57-21:18 |
| PLT-15 | M | 9.1 | 2.0 | 1/1 | 12.4 | 20:57-21:10 |
| GCP-12 | M | 5.2 | 1.5 | 1/1 | 12.0 | 20:57-21:09 |
| GCP-6 | M | 3.6 | 2.3 | 2/2 | 11.9 | 21:08-21:20 |
| GCP-13 | M | 4.3 | 2.1 | 1/1 | 7.0 | 21:12-21:19 |
| GCP-7 | M | 7.6 | 2.6 | 1/1 | 10.7 | 21:21-21:31 |
| GCP-8 | M | 5.7 | 2.1 | 1/1 | 8.6 | 21:32-21:40 |
| GCP-9 | L | 5.9 | 1.7 | 1/1 | 8.6 | 21:42-21:51 |
| GCP-76 | S | 1.9 | 2.5 | 1/1 | 7.8 | 21:49-21:57 |
| PLT-176 | S | 4.2 | 3.2 | 1/1 | 8.6 | 21:49-21:58 |
| PLT-177 | XS | 0.8 | 0.8 | 1/1 | 6.8 | 21:49-21:56 |
| PLT-178 | S | 1.4 | 0.8 | 1/1 | 6.8 | 21:49-21:56 |
| GCP-77 | XS | 3.9 | 2.4 | 2/2 | 8.0 | 21:55-22:03 |
| GCP-78 | S | 1.8 | 1.4 | 1/1 | 3.6 | 22:03-22:07 |
| GCP-10 | S | 2.2 | 0.6 | 1/1 | 5.1 | 22:05-22:10 |

PLT-1, PLT-9 and PLT-10 had only a worker that did the local parts (0.5, 1.9 and 1.0 minutes). PLT-177
and PLT-178 shared one reviewer, and so did GCP-2 and GCP-10; that time is split between the cards.

| Effort | Cards | Median worker | Median review | Median wall | Wall minutes per point |
|---|---|---|---|---|---|
| XS | 2 | 2.4 | 1.6 | 7.4 | 7.4 |
| S | 17 | 1.8 | 1.3 | 6.8 | 3.4 |
| M | 16 | 4.8 | 2.0 | 9.7 | 3.2 |
| L | 4 | 7.9 | 2.9 | 21.1 | 4.2 |

All the agents together ran 236 minutes (160 of work, 77 of review) for 97 points: **2.4 agent-minutes
per point**.

## On time or not

**Not on time.** The plan was 137 points in 2 hours (68.5 points an hour; D11 had projected 61 from
research and planning). SP2 finished 97 points by 22:10, 55 minutes after the planned end: **33 points
an hour, 49% of plan.** The 40 points left over are 36 points of outward-blocked cards (PLT-1, PLT-7,
PLT-9, PLT-10, PLT-16, PLT-18, PLT-19, PLT-24 to PLT-29, which need a GitHub remote or marketplace
accounts: Q7, Q8) plus the 4 points of the audit and retro cards, which run after the code.

**Card size was not the problem.** Measured from agent events, a card's wall time grows with its size
at about 3.2 to 4.2 minutes per point for S, M and L. The L figure includes two failed reviews out of
four L cards. Counting agent time only, L to M is 10.8 to 6.8 minutes, the 5:3 ratio the points
assume. The "5 to 26 minutes regardless of size" reading came from the faulty board timestamps. Only
XS is off: an XS card costs as much as an S, because the fixed cost of a dispatch and a review dominates.

**The hypothesis holds: the time went to sequencing and limited parallelism.**

- *Concurrency.* Over the 176 minutes from 19:15 to 22:11, on average 1.34 card agents were running.
  For 38 minutes none was (22%: the coordinator was reading reports, verifying, committing or waiting
  on the owner). One agent ran for 80 minutes, two for 35, and three or more for only 23. The peak was
  6 at 20:57: PLT-22, PLT-23, PLT-15, GCP-12, the GCP-5 review and the GCP-11 re-review, each in a
  different module. The ceiling was not the machine: the M2 to M6 planning coordinator ran 2 to 4
  more agents beside SP2 from 19:18 to 20:36.

  | Window | Mean card agents |
  |---|---|
  | 19:15-19:45 | 0.8 |
  | 19:45-20:15 | 1.2 |
  | 20:15-20:45 | 1.6 |
  | 20:45-21:15 | 2.0 |
  | 21:15-21:45 | 1.0 |
  | 21:45-22:11 | 1.3 |

  Planned work needs 137 x 2.4 = about 330 agent-minutes. That fits in 120 minutes only at a
  sustained concurrency of 2.75 or more, which SP2 never reached for half an hour.
- *Critical path.* The longest `depends_on` chain is PLT-2, PLT-3, PLT-8, GCP-1, GCP-57, GCP-3, GCP-4,
  GCP-5, GCP-7, GCP-8: **104 minutes** of card wall time, or 88 of agent time only (with GCP-2 in
  place of GCP-57). That is 73 to 87% of the sprint before any handoff gap, so the chain alone could
  not finish in two hours. Along it, the median wait from "dependency done" to "next card's worker
  starts" was 5.2 minutes.
- *Module lanes.* A module has one folder and one published version in the shared local registry, so
  only one agent can work it at a time. Cards off the critical path waited long after their
  dependencies were done because their module was busy:

  | Card | Wait after dependencies done | Cause |
  |---|---|---|
  | GCP-9 | 70 min | `gcode-parser` was busy with GCP-4 to GCP-8 |
  | GCP-11 | 45 min | a stale `depends_on: GCP-5` from before the module split, dropped at 20:37 |
  | PLT-14 | 45 min | the PLT lane ran tooling cards first |
  | PLT-15 | 29 min | the PLT lane ran tooling cards first |
  | PLT-20 | 23 min | the PLT lane ran tooling cards first |

  Two PLT cards that both changed `tooling` collided: PLT-22 published tooling 0.8.0, then PLT-23
  needed a tooling fix (0.8.1) and a second round. The plan had roughly two lanes, PLT and GCP, of
  44 and 53 points: about **15 to 18 points an hour per lane**.
- *Stalls.* At 19:15 the owner was asked Q7 (a GitHub remote) and Q8 (marketplace accounts), and
  answered both by 19:17. The module-structure decision then stopped the sprint's first card. PLT-2's
  workspace scaffold was committed at 19:19 and thrown away. No card agent ran from 19:19 to 19:23
  (D12 was accepted at 19:23:43). The rework ran 19:23 to 19:29, and the board was rewritten for
  independent modules at 19:31. The first card on the critical path lost about 13 minutes. GCP-2 then
  held three owner questions (Q9 at 19:56, Q10 at 20:10, Q11 at 21:42), and its card stayed open
  until 22:10.
- *Failed reviews.* 5 of the 37 reviewed cards (14%) failed their first review and needed a fix
  round: GCP-3, GCP-11, GCP-6, GCP-77 and PLT-23. Each round added 3 to 10 minutes of wall time,
  about 6 at the median. The bugfix cards from the mid-sprint audit (10 points, 21:49 to 22:07) ran
  inside the sprint's time.

## Why: cards well over or under their size

| Card | Size | Ran | Cause |
|---|---|---|---|
| GCP-2 | L | 134 min wall, 17 of it agent time | Outward-blocked. Only Bambu Studio and Orca were installed. The owner was asked to install the other slicers (Q9: no, use upstream samples), to supply an H2C file (Q10: supplied at 21:37), and to cut the scope (Q11 at 21:44: Bambu and Orca now; PrusaSlicer, SuperSlicer, Cura and multi-material moved to GCP-79, M). Notes: `.reference/notes/GCP-2-golden-corpus.md`. |
| GCP-11 | L | 24 min | Failed review: the truncation diagnostic needed a fix (20:54), and the re-review took 6 minutes. Before that it waited 45 minutes on a stale dependency on GCP-5, which the coordinator dropped at 20:37 (activity note). |
| GCP-3 | L | 18 min | Failed review: relative-E semantics under G91 and M83, and a leading UTF-8 BOM, fixed in 0.2.1 (card Progress, "Review fixes"). The parser's protocol semantics are where reviews catch real bugs. |
| GCP-57 | S, opus | 17 min wall, 9.5 agent | Ran over. Its work (6.5 min) was longer than the median M, because it settled state-change design decisions that GCP-3 relied on (notes `GCP-57-state-changes.md`). Its review then started 7.5 minutes after the worker finished: the coordinator was busy. Design cards that fix a shared contract are at least M. |
| PLT-23 | S | 20 min | It collided with PLT-22 in the shared `tooling` module: tooling 0.8.1 had to fix `vsslicer-package`, the bins and `check-licence` before the pack could package (card Progress). Module-lane conflict. |
| PLT-2 | M | 12 min, redone | The owner decided on independent modules mid-card (D12). The first scaffold (`62b9723`) was discarded. |
| PLT-6 | S | 10 min | The review (5.5 min) ran five times longer than the work (1.1 min). A licence review checks every package's fields. |
| PLT-15 | M | 12 min, 9 of worker | Downloading VS Code for `@vscode/test-electron` was slow. The audit later filed PLT-176 to share that download. |
| GCP-77 | XS | 8 min | Failed review: 0.8.1 was published with a stale `dist`. The fix added `prepack: pnpm build` and released 0.8.2. A publish step without a rebuild is a process bug that the review caught. |
| GCP-6 | M | 12 min | Failed review: a missing source path had to reject with a typed `ENOENT` error. A small fix round. |
| GCP-9 | L | 8.6 min | Ran under. Arc tessellation ran like an M once the parser core existed. It still finished late (21:51) because it waited 70 minutes for the `gcode-parser` lane. |
| GCP-5, PLT-11, PLT-14, PLT-8 | M, M, S, S | 3.4 to 5.2 min | Ran under. Each extended a module that was already scaffolded. |
| PLT-1, PLT-9, PLT-10 | S, M, S | 0.5 to 1.9 min of local parts | Outward-blocked on a GitHub remote (Q7). They carry over. |

By model: the two Opus cards that finished (GCP-1, GCP-57) had worker times of 5.7 and 6.5 minutes,
close to Sonnet's median M (4.8). They cost $2.65 each, against about $1 to $1.50 for a Sonnet M
(facts table). Opus did not deliver faster. It earns its place on contract cards such as GCP-57,
whose decisions held up downstream, and isn't needed for plain extensions.

By type: the bug cards (6 of them, 10 points) took 3.6 to 8.6 minutes each. The audit's fixes are
cheap, but each still pays the fixed cost of a dispatch and a review.

## Change

Rules written into `.ai/plans/estimation.md` under "Rules learned", each with its evidence:

1. Plan implementation at the measured 33 points an hour, not research's 61. With 2-hour sprints,
   capacity is about 66 points until a later close remeasures it.
2. Every card costs about 5 minutes of fixed overhead (dispatch, review handoff and review). Count XS
   as 2 points at planning time, or batch XS cards in the same module into one dispatch and one
   review.
3. Budget one fix round for every 7 reviewed cards (14%), at about 6 minutes each. Parser and protocol
   L cards failed review 2 times in 4.
4. One agent per module at a time. Sprint capacity is the number of modules with ready work times
   about 16 points an hour. Plan at least 4 independent module lanes to fill a 66-point sprint, and
   never put two cards that publish the same module in parallel.
5. Check the critical path. The longest `depends_on` chain, at about 3.5 wall minutes per point plus
   5 minutes of handoff per card, must be at most 60% of the sprint. SP2's was 104 minutes of 120.
6. Outward-blocked cards (owner accounts, a remote, owner hardware or fixtures) don't count toward
   capacity. Their local parts go in a separate card, or in the sprint after the owner unblocks them.
7. Fix `depends_on` against the module layout before the sprint starts. A stale dependency held
   GCP-11 for 45 minutes.
8. A contract or design card that later cards build on is at least M, on Opus. GCP-57 was sized S and
   took M time.
9. Measure retros from the agent start and stop events, not board moves. The coordinator moves a card
   to doing when it dispatches the worker, and board migrations must keep cards' done times.

## Re-sizing

**No cards re-sized.** The evidence says relative sizes are right: S, M and L ran at 3.2 to 4.2 wall
minutes per point, and L to M by agent time is 5:3. The overrun came from velocity and parallelism,
which rules 1, 4 and 5 handle at the sprint level, not card by card.

- **XS:** 165 XS cards remain, mostly XS release cards in profiles, SP10 to SP19. The evidence that XS
  costs as much as S is two cards, one of them with a failed review. That is too thin to re-size 165
  cards. Rule 2 covers them at planning time instead, and SP3's retro should check it with more XS
  data.
- **Carried cards PLT-1, PLT-9 and PLT-10:** only their remote-side checks remain. Shrinking them to
  XS would contradict rule 2, so they keep their sizes.

These SP3 dependencies need checking (they are not size problems, and I did not change them):

- GCP-25 (compare against PrusaSlicer M73 totals) depends on GCP-2. Since Q11, GCP-2 holds no
  PrusaSlicer fixtures; they moved to GCP-79. GCP-25 should depend on GCP-79, or move with it.
- GCP-29 (measure three H2C prints) needs the owner's printer (D14). By rule 6 it is outward-blocked.
- GCP-18 and GCP-21 run "in CI", and there is no remote yet (Q7). Only their local parts can finish in
  SP3.
