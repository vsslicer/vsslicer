# Estimation guide

How to size VSSlicer cards so plans match what agents actually deliver. Every sprint retro updates
this file from measured data (`board.py retro SP<n>`); planners read it before sizing cards or
running `plan-sprints`.

## Current calibration

After SP2 (first implementation sprint, retro `.ai/retros/SP2-retro.md`):

- Effort sizes (`XS` 1, `S` 2, `M` 3, `L` 5, `XL` 8 points) are relatively right: S, M and L cards ran
  at 3.2 to 4.2 wall minutes per point, 2.4 agent-minutes per point.
- Implementation velocity is **33 points per hour** of sprint (SP2: 97 points, 19:15 to 22:10), not
  the 61 measured on research and planning. The gap was parallelism and sequencing, not card size.

After SP4 (retro `.ai/retros/SP4-retro.md`):

- **Plan at 46 points an hour** (92 per 2-hour sprint). SP4 measured 46.5 (72 points, 23:16 to 00:49)
  and ran out of workable cards 41 minutes early, so 46 is a floor, not a ceiling. SP3's 81 was over
  46 minutes with no long cards.
- Agent time is **3.2 agent-minutes per done point** (SP3 1.5): Opus about 2.6 a point on built cards,
  Sonnet about 1.3, and measuring spikes 40 minutes or more. Rule 10's divisor of 1.5 over-states
  capacity by about two times when Opus spikes and long cards are in the sprint; use 46 an hour.

## Rules learned

Each rule: the rule, its evidence (sprint and figures), since when.

1. **Plan implementation at 33 points an hour** (66 per 2-hour sprint) until a later close remeasures
   it; research and planning velocity does not carry over. Evidence: SP2 planned 137 points at 68.5
   an hour, finished 97 at 33.3. Since SP2.
2. **Every card has about 5 minutes of fixed overhead** (dispatch after its dependencies are done:
   median 5.2 min; worker-to-review handoff about 1.3 min; review median 1.7 min). Count XS as 2
   points when planning, or batch XS cards of one module into one dispatch and one review. Evidence:
   SP2 XS median wall 7.4 min, S 6.8 min; PLT-177 and PLT-178 shared one review. Since SP2.
3. **Budget one fix round per 7 reviewed cards**, about 6 minutes each, and expect more on parser and
   protocol cards. Evidence: SP2 5 of 37 failed first review (GCP-3, GCP-6, GCP-11, GCP-77, PLT-23),
   +3 to 10 min each; 2 of the 4 L cards failed. Since SP2.
4. **One agent per module at a time; capacity is lanes, not points.** A module has one folder and
   one version in the shared local registry, so a lane does about 16 points an hour. A 66-point
   sprint needs at least 4 modules with ready work at once; never schedule two cards that publish the
   same module in parallel. Evidence: SP2 mean 1.34 card agents running (3 or more for only 23 of
   176 minutes), PLT lane 44 and GCP lane 53 points in 2.9 hours; GCP-9 waited 70 min for
   `gcode-parser`; PLT-22 and PLT-23 collided in `tooling`. Since SP2.
5. **Check the critical path before the sprint**: the longest `depends_on` chain, at about 3.5 wall
   minutes per point plus 5 minutes of handoff per card, must fit in 60% of the sprint; otherwise move
   its tail to the next sprint. Evidence: SP2's chain PLT-2 to GCP-8 took 104 of 120 minutes. Since SP2.
6. **Outward-blocked cards don't count toward capacity** (owner accounts, a remote, owner hardware or
   fixtures, owner decisions). Plan their local parts as their own card, or plan the card after the
   owner unblocks it. Evidence: SP2 carried 36 points (PLT-1, 7, 9, 10, 16, 18, 19, 24 to 29: Q7, Q8);
   GCP-2 ran 134 min wall for 17 min of agent time across Q9, Q10 and Q11. Since SP2.
7. **Re-check `depends_on` against the module layout when planning a sprint.** Evidence: SP2 GCP-11
   kept a dependency on GCP-5 from before the module split and started 45 minutes late. Since SP2.
8. **A contract card other cards build on is at least M, on Opus**; plain extensions of an existing
   module stay on Sonnet. Evidence: SP2 GCP-57 (S, Opus) worked 6.5 min, more than the M median of
   4.8; Opus cards ran no faster than Sonnet at about twice the cost ($2.65 against $1 to $1.50 for M).
   Since SP2.
9. **Measure from the agent events.** Retros take card times from the start, stop and dispatch events
   in `activity.jsonl`. The coordinator moves a card to doing when it dispatches, and board migrations
   must keep done times. Evidence: SP2's `board.py retro` Minutes column was unusable; workers moved
   cards to doing at the end of their run, and `ee9667a` re-stamped all done times to 22:07. Since SP2.
10. **Plan capacity from concurrency: points = sprint minutes x mean running agents / 1.5**, and the
    sprint's workable points (not owner- or dependency-blocked) must not exceed it. At SP3's mean of
    2 agents that is 80 points an hour; this replaces rule 1's 33. Check before the sprint starts: the
    sum of workable assigned points is at most the stated capacity. Evidence: SP3 ran 95 agent-minutes
    for 62 points (1.5 per point, SP2 2.4), 81 points an hour at a mean of 2.0 running agents; the
    sprint doc said capacity 122 but assigned 129 workable points (182 in all), and 67 were never
    started. Since SP3.
11. **Dispatch per lane, not per wave.** When a lane's agent stops, its next card (or its review) is
    dispatched within 2 minutes; the coordinator commits and verifies while other lanes run.
    Testable from `activity.jsonl`: time with no agent running stays under 15% of the sprint.
    Evidence: SP3 had no agent running for 17.5 of 47 minutes (37%); wave 1 dispatched 22:25, its
    Sonnet workers were done by 22:28, but wave 2 started at 22:35 after GCP-19 (22:33). Peak was 8
    agents, mean 2.0. Since SP3.
12. **Budget fix rounds by kind:** one per 9 bugfix cards, one per 2 cards of new code (ports of
    upstream algorithms, protocols, contracts, research decisions). Each fix round costs a review
    wave, about 5 minutes wall, even when the fix takes under a minute. Evidence: SP3 8 of 22 failed
    first review; bugs 1 of 9 (PLT-183), the rest 7 of 13 (GCP-19, GCP-24, PRN-1, PLT-35, GCP-14,
    PLT-36, PLT-37); fixes took 0.4 to 4.4 agent-minutes. Since SP3.
13. **Release shared modules once per sprint.** Changes to `tooling` and `*-api` modules ship in one
    release at the start or end of the sprint, followed by one lockfile-only re-lock of every
    dependent (`pnpm update --no-save`) and one clean-registry `node scripts/run.mjs ci`: plan about
    5 minutes of coordinator time for it. A card that changes a shared module and its consumers is at
    least L, or split per module. Evidence: SP3 every tooling or gcode-api release made dependents
    stale under PLT-179's check (PLT-180's pins after gcode-api 0.4.1); holding tooling 0.8.2 to the
    end and re-locking 10 modules once passed a clean-registry ci in 70 s (`35dc269`). Since SP3.
14. **A module lane may take two cards at once** when they change disjoint files and neither
    publishes; the coordinator releases the module once after both pass. Evidence: SP3 GCP-20
    (Klipper) and GCP-24 (Marlin) ran in parallel in `gcode-planner` (22:35 to 22:44), both
    unreleased, with no conflict; the coordinator released 0.2.x. Since SP3.
15. **A port card lists the parser and API inputs it needs, and missing ones become their own card
    when planning.** Evidence: SP3 GCP-20 needed arc resolution and ESTIMATOR_ADD_TIME the parser
    does not carry (split to GCP-82, GCP-83), GCP-14's parser side became GCP-84, and GCP-19 left
    worker wiring to GCP-30; three cards were created at review time. Since SP3.
16. **Move each card to done when its review passes**, not in one batch at the end, and to doing
    when its worker is dispatched. Testable: done times in `board.py retro` differ per card.
    Evidence: SP3 all 22 done cards moved at 23:04:15 to 23:04:17 and starts were stamped at wave
    commits, so the facts table's Minutes column (13 to 41) again measures nothing; rule 9 was not
    followed. Since SP3.
17. **Never mix long and short agents in one dispatch message** while the harness returns a message's
    Agent calls only when all of them stop. Agents expected to run over 10 minutes (Opus spikes, an L
    that creates a module) go out alone or in the sprint's last message; short lanes get two cards in
    sequence per agent. Testable from `activity.jsonl`: the median time from a worker's stop to its
    review's start stays under 10 minutes. Evidence: SP4 wave 1 (23:22) sent seven agents with a
    median run of 1.3 min with GCP-30 (32.9) and PLT-31 (41.6); the short cards waited 39 to 44 min in
    review and were done 45 to 47 min after dispatch; later waves without long agents turned over in 9
    to 13 min. Since SP4.
18. **A card that creates a module with VS Code integration tests, or a spike that measures with
    repeated runs, is XL or is split into build and measure**, and every OS a spike must run on other
    than the coordinator's is its own owner-blocked card at planning (rule 6). Testable: no card ends a
    sprint partial for a reason its acceptance criteria named at planning. Evidence: SP4 GCP-30 (L)
    ran 32.9 agent-min, three to five times the other L cards (6.3 to 8.6); PLT-31 (L) ran 41.6 and,
    with PLT-33, GCP-79 and GCP-18, ended partial on owner input (Q15, Q16, slicer exports, Q7): 14
    points. Since SP4.
19. **Reviewers fix in place only what changes no behaviour** (docs, comments, attribution, licence
    headers, CHANGELOG, ignore files) and record it in Progress; a behaviour change, however small, is a
    fix round. With that, budget one fix round per 6 new-code cards (replacing rule 12's one per 2),
    and about 15 minutes of wall time each under wave dispatch. Evidence: SP4 3 of 20 new-code cards
    failed review (GCP-82, PLT-31, PLT-43), each fix 0.6 to 1.6 agent-min but 12 to 24 min of wall
    time across two barriers; six more findings were fixed in place, one of them a behaviour change
    (GCP-27's fallback feedrate 25 to 50 mm/s). Since SP4.
20. **Commit each card when its review passes**, before another card that touches its files is
    dispatched. Cards in one module that run at the same time (rule 14) leave CHANGELOG, README,
    `index.ts`, `package.json` and the lockfile to the coordinator's release commit, and list their
    lines in Progress. Testable: each card's Done in `board.py retro` (read from git) is within 5
    minutes of its reviewer's move to done. Evidence: SP4 reviewers moved cards to done from 00:06:59
    to 00:49:26, but all were committed 00:43:30 to 00:44:47 (22 commits), split by file with "also
    carries" notes because PLT-39 changed PLT-187's and PLT-188's files, GCP-27 GCP-28's `bambu.ts`,
    and GCP-83, GCP-23 and GCP-82 all `klipper.ts`; the facts table's Done column read 00:43 for every
    card. Since SP4.
21. **Workers never publish.** The coordinator publishes each module once per sprint, after the last
    card that changes it has passed review, then runs one clean-registry `run.mjs ci` (extends rule
    13 to every module). Testable: one version per module per sprint in `git log`. Evidence: SP4
    gcode-parser shipped 0.9.0 (GCP-83), 0.10.0 (GCP-84) and 0.10.1, because GCP-79 and GCP-18 changed
    its `package.json` after 0.10.0; the clean-registry ci failed lockfile integrity once and needed
    gcode-preview 0.2.1 too (`39a31c1`). Since SP4.
22. **Every agent prompt names a `mktemp -d` scratch directory**; agents delete only files they
    created there and use `command ls -1` (not the aliased `ls`) in scripts. The coordinator runs
    `git status --short` after each wave and restores any change outside the dispatched cards' files.
    Testable: zero stray-file incidents in the next retro. Evidence: SP4 had four in 55 agents: files
    named after `ls` output in a board folder (twice), a reviewer deleting another's note, `rm -rf
    /tmp/x` on a directory the reviewer did not create, and the GCP-82 fix worker overwriting its
    card. Since SP4.
