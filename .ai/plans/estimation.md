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

After SP5 (retro `.ai/retros/SP5-retro.md`):

- **Plan at 60 points an hour, bounded by lanes** (rule 23). SP5 measured 60.0 (63 delivered points,
  01:06 to 02:09) and again ran out of workable cards, 81 minutes early, with one lane busy; 60 is a floor.
  A module lane does about 20 points an hour (gcode-preview 18, gcode-language 25), so a 2-hour sprint
  holds about 40 points per lane that has work, and the busiest lane sets its length.
- Agent time is **1.6 agent-minutes per done point** (SP4 3.2): Opus about 1.9 a point, Sonnet 0.9, with
  no long spike in the sprint. Rule 10's formula held: 65 minutes x 1.54 agents / 1.5 = 67 against 63.
- close-sprint records 4 more points than delivered: the audit and retro cards (rule 24; SP5 67).

After SP6 (retro `.ai/retros/SP6-retro.md`):

- **Plan at 20 points an hour per lane with work** (rule 23 confirmed): SP6 ran four lanes at 20 to 22
  each, 73.2 points an hour (155 delivered points, 02:27 to 04:34), and again stopped early (56 minutes)
  with two workable cards in SP7. A 3-hour sprint with four lanes holds about 240 workable points.
- Agent time is **1.76 agent-minutes per done point** (SP5 1.6): Opus workers 1.6 a point, Sonnet 0.6;
  reviews and fixes are half of all agent time (143 of 273 minutes). Rule 10's divisor is 1.75, not 1.5.
- Dispatch stays in waves: one agent per message serialises the sprint (rule 11). Idle time from the first
  wave to the last review is 22% (SP5 29%); finished agents waited 449 agent-minutes, mostly behind two
  long agents (rule 17).
- close-sprint records 159 of 223 (155 plus the audit and retro cards).

After SP7 (retro `.ai/retros/SP7-retro.md`):

- **Plan only workable points, at 20 an hour per lane that has them** (rule 23 held again: the profiles
  lane did 44 points in 128 minutes, 20.6 an hour). SP7 delivered 75 points in 138 minutes (32.6 an hour)
  against a plan of 87 an hour that counted 154 owner-blocked points; the gcode, viewer and platform lanes
  ran dry (9, 6 and 2 points an hour).
- Agent time is **3.3 agent-minutes per done point** (SP6 1.76) when Opus catalogue cards are in the
  sprint: Opus workers 4.6 a point (PRF-16 30.7 min, PRF-18 23.1), Sonnet 0.9; reviews and fixes 46%.
  Use rule 10's divisor of 1.75 only for sprints without long Opus agents (rule 17).
- Idle 15.9% from the first wave to the last review (SP6 22%); finished agents waited 393 agent-minutes
  (SP6 449), 253 of them behind PRF-16 and PRF-18.
- First-review failures 1 in 3.9 (rule 19), median 23.7 minutes of wall each.
- close-sprint records 79 of 235 (75 plus the audit and retro cards).

After SP8 (retro `.ai/retros/SP8-retro.md`):

- **Plan lanes in review cycles, not points** (rule 23 amended): SP8 delivered 88 points in 80.7 minutes
  of building (65.4 an hour; plan 65 workable points, 49 an hour) from about 25 lanes, but feature lanes
  ran 3 to 12 points an hour (profiles 11.6, profiles-prusa 7.6). A card that passes review takes about
  12 minutes from dispatch to done, S or M alike; each failed review adds about 12.
- Agent time is **1.86 agent-minutes per done point** (SP7 3.3) with no agent over 7.5 minutes; reviews
  and fixes are 64% of agent time (83.9 and 20.7 of 164.1).
- Idle 21.2% from the first wave to the last review (SP7 15.9%), all of it in 16 short gaps between 17
  alternating worker and review waves; finished agents waited 123.8 agent-minutes (SP7 393).
- First-review failures 1 in 3.0 (features 12 of 18, chores 0 of 18, bugs 1 of 3); 19 fix rounds, 6 of
  them on resource bounds (rule 25's target is one).
- close-sprint records 92 of 305 if the audit and retro cards are done (88 plus VSS-47 and VSS-82).

After SP9 (retro `.ai/retros/SP9-retro.md`):

- **Plan about 4 cards an hour per lane at sprint start** (rule 23 amended): SP9 built 58 points in 81.1
  minutes (42.9 an hour; plan 92) from 12 lanes; the one lane with work all sprint (profiles-prusa) did 4
  cards, 11 points in 67 minutes. A passing card took a median 15.8 minutes from dispatch to done (SP8 11.9)
  in waves of 9 to 15 agents, and 8 to 10 in waves of 2 to 6.
- Agent time is **4.2 agent-minutes per built point** (SP8 1.86): reviews 126.3 of 245.2 agent-minutes, all
  Opus, on mostly 2-point bug cards; reviews and fixes 66.7%.
- Mixed review-and-worker messages (rule 11, tried first in SP9) raised agents per wave from 4.0 to 7.0 but
  idle was 31.4% (21.7% without a 10.3-minute coordinator restart) and finished agents waited 243.4
  agent-minutes (SP8 123.8).
- First-review failures 1 in 2.1 (features 9 of 12, bugs 3 of 14, all three the wall-clock-assert cards);
  19 failed reviews, 4 of them on resource bounds although every card had a Bounds criterion.
- close-sprint records 66 of 280 if the audit and retro cards are done (62 plus VSS-48 and VSS-83; 62
  includes the SP4 spikes PLT-31 and PLT-33, closed on Q16 without SP9 work).

After SP10 (retro `.ai/retros/SP10-retro.md`):

- **Plan about 5 cards an hour per lane, less one per expected round** (rule 23 amended): SP10 delivered 86
  points (69 built in SP10) in 63.4 minutes, 81.4 an hour (65.3 built; SP9 42.9). Per-lane dispatch (rule 11)
  ran a mean of 5.35 agents with 0.1% idle; a passing card took a median 8.2 minutes from dispatch to done, a
  card with one round 20.8.
- Agent time is **3.8 agent-minutes per done point** (SP9 4.2); reviews and fixes 58.6% (113.5 and 75.7 of 323.1).
  Worker time follows effort: L 12 to 16 agent-minutes, M median 5.8, S bugs under 3.
- First-review failures 1 in 1.6 (features 12 of 14, bugs 3 of 9, chores 3 of 5); 22 failed reviews, 5 of them
  on resource bounds. About 14 dispatches refused by the permission classifier (rule 29).
- The sprint ended 62 minutes early with 21 workable points in SP10 (PRF-42, 52, 53, 54, 127).
- close-sprint records 90 of 114 if the audit and retro cards are done (86 plus VSS-49 and VSS-84; 114 is the
  rebalance's 92 plus ten in-flight cards set back, 20 points, and PLT-202).

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
    **Amended SP5:** per-lane dispatch is not available while a message's Agent calls return together:
    the coordinator is blocked until they do, so its commits, releases and moves all fall between waves.
    Keep the gap from a wave's last stop to the next wave's start under 2 minutes, prepare the next
    prompts and the sprint's trim ahead (trim at the previous close), and try sending a gap's commits
    in the same message as the next wave's Agent calls (untried). Testable: idle time without the first
    dispatch and the final release stays under 15%. Evidence: SP5 every agent sent with
    `run_in_background: true` still returned per message; no agent ran for 26.1 of 65.1 minutes (40%):
    7.2 for the trim at the start, 3.0 for the release, 15.9 in ten gaps (median 1.2), 29% without the
    first two; all 25 card and release commits (`913e9b5` to `2c12e29`) fall in those gaps.
    **Amended SP6:** one agent per message is not per-lane dispatch: a `run_in_background` Agent call
    still blocks its message until the agent stops, so one agent per message runs one agent at a time.
    Dispatch in waves; measure idle from the first wave's start to the last review's stop. Testable: under
    15% on that basis. Evidence: SP6 the GCP-98 worker, sent alone at 02:31:41, returned at 02:37:17 (5.6
    min); no other agent ran and the coordinator wrote no event, while five cards it had moved to doing at
    02:31 waited until 02:38. With waves after that: 22% idle from 02:38:11 to 04:28:15 (28% over the whole
    sprint), 17 gaps of median 1.7 min, three over 2 min; no commit or coordinator event inside a wave.
    **Amended SP8:** with short gaps, idle is set by the number of waves. A message may carry reviews of
    one lane and workers of another when all of them are short (rule 17 forbids mixing long with short,
    not reviews with workers), so a sprint needs about one wave per card cycle instead of two (untried).
    Testable: idle under 15% from the first wave to the last review. Evidence: SP8 alternated
    workers-only and reviews-only messages, 17 waves for 40 cards; gaps median 0.8 min (16.9 in all, one
    over 2), idle 21.2% of 80.5 minutes.
    **Amended SP9 (tried):** mixing works and stays: 7.0 agents a wave (SP8 4.0), 11 waves for 25 built
    cards and 19 failed reviews. It did not bring idle under 15%: the gaps carry one wave's commits and the
    next wave's prompts (median 1.45 min), and a mixed wave lasts as long as its longest review. Keep a wave
    to about 8 agents, a review to at most two cards, and write the next wave's prompts while the current
    one runs. Testable unchanged, excluding a restart the main session causes. Evidence: SP9 idle 31.4% of
    82.6 minutes from 09:17:00 to 10:39:38, 21.7% without the 10.3-minute coordinator restart; the other
    large gap (3.7) was the re-plan from the owner's answers.
    **Amended SP10:** per-lane dispatch works: the harness runs subagents in the background with one
    notification per agent, so a lane's next agent goes out when its last one stops. The wave guidance of SP5
    to SP9 is retired. Testable: idle under 15% from the first card agent to the last, and the median handoff
    between agents on one card under 2 minutes. Evidence: SP10 idle 0.1% of 60.4 minutes (one 0.08-minute
    gap), mean 5.35 agents running, handoff median 0.6 minutes over 45 (over 2 only where dispatches were
    refused, rule 29).
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
    **Amended SP7:** a `tooling` release is a patch unless it breaks consumers' config; a minor
    (0.x to 0.x+1) leaves every module's `^0.x` range unsatisfied, so it is its own card that re-ranges
    every module. Testable: one published tooling version per sprint. Evidence: SP7 tooling 0.9.0
    (`e5ef902`) failed the clean-registry lockfile integrity check in every `^0.8` module and was
    re-versioned as 0.8.3 (`03873c5`).
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
    **Confirmed SP5:** with no long agent mixed in except where unavoidable, two cards in sequence per
    lane agent and reviews in the next message, the median stop to review was 4.6 minutes (SP4 43),
    finished agents waited 98 agent-minutes (SP4 594) and doing to done was 10.3 (SP4 45). The longest
    agent still sets its wave: keep agents expected over 5 minutes (Opus spikes and contract cards, an L
    in the preview) together, or with lanes whose next card is also long. Evidence: SP5 the GCP-49
    spike (6.3) held wave 1's 0.6-minute fixes 22 agent-minutes, GCP-37 (5.4) wave 4's 25, GCP-38
    (10.4) wave 8's 15.
    **Amended SP6:** a card that runs a browser or VS Code suite (Playwright, VS Code integration tests)
    or measures with repeated runs counts as long whatever its size: it goes in a message only with
    other long agents, or last. Testable: finished agents wait under 150 agent-minutes in a sprint.
    Evidence: SP6 PLT-192 (S, Playwright suite) ran 16.3 min among 13 agents of median 1.6 (190
    agent-minutes waiting; PRF-7's and VWR-5+6's fixes held 16 to 18 min); the VWR-37 spike (15.2) and
    PRF-14 (9.7) went with five short agents (64.5); 449 in all (SP5 98). The median stop to review was
    still 5.3 min.
    **Amended SP7:** split, before dispatch, any card whose agent is expected over 15 minutes (an Opus L,
    or a catalogue or generator card over more than one slicer's keys) per slicer or per input, and never
    put reviews in a message with a long worker: the message blocks the coordinator, so the reviewed
    cards cannot be committed until the long agent stops. Testable: no agent over 15 minutes in the next
    sprint, and finished agents wait under 150 agent-minutes. Evidence: SP7 PRF-16 (L, Opus, three
    slicers' keys) ran 30.7 min with four workers and three reviews (180 agent-minutes waiting; the
    reviewed cards' commits waited about 25 min), PRF-18 (M, Opus, four slicers) 23.1 with four short
    agents (72.8); 393 in all.
    **Amended SP9:** a review of three cards counts as long, and a message that mixes reviews and workers
    is long if any agent in it is. Testable: finished agents wait under 150 agent-minutes. Evidence: SP9
    the PRF-186, 188 and 187 review ran 12.7 min and the GCP-21 worker 11.8 (a Rust build) in a 15-agent
    wave: 116.4 agent-minutes waiting there, 243.4 in all (SP8 123.8); no agent over 15 minutes (met).
    **Amended SP10:** with per-lane dispatch (rule 11) no message holds a finished agent, so the waiting
    target and the mixing rule are retired. Still split, before dispatch, a card whose agent is expected over
    15 minutes: a long agent now lengthens only its own lane. Testable: no agent over 15 minutes. Evidence:
    SP10 seven agents over 10 minutes (GCP-42's fix 17.0, PRF-60 and PRF-67 in one worker 16.7, GCP-42 15.7,
    PRF-30 14.2, PRF-27 13.2, PRF-31 12.4, PRF-25 12.2) held no other lane; idle 0.1%.
18. **A card that creates a module with VS Code integration tests, or a spike that measures with
    repeated runs, is XL or is split into build and measure**, and every OS a spike must run on other
    than the coordinator's is its own owner-blocked card at planning (rule 6). Testable: no card ends a
    sprint partial for a reason its acceptance criteria named at planning. Evidence: SP4 GCP-30 (L)
    ran 32.9 agent-min, three to five times the other L cards (6.3 to 8.6); PLT-31 (L) ran 41.6 and,
    with PLT-33, GCP-79 and GCP-18, ended partial on owner input (Q15, Q16, slicer exports, Q7): 14
    points. Since SP4.
    **Amended SP6:** a measuring card (a spike or CI benchmark over large inputs) is at least L. Evidence:
    SP6 VWR-37 (M, Opus) measured parse, dedup and BVH at 1, 5 and 20 M triangles for 15.2 agent-min,
    about five times an Opus M build (3.2 to 5.6), and created VWR-389; VWR-32, VWR-50 and GCP-42 re-sized
    M to L.
19. **Reviewers fix in place only what changes no behaviour** (docs, comments, attribution, licence
    headers, CHANGELOG, ignore files) and record it in Progress; a behaviour change, however small, is a
    fix round. With that, budget one fix round per 6 new-code cards (replacing rule 12's one per 2),
    and about 15 minutes of wall time each under wave dispatch. Evidence: SP4 3 of 20 new-code cards
    failed review (GCP-82, PLT-31, PLT-43), each fix 0.6 to 1.6 agent-min but 12 to 24 min of wall
    time across two barriers; six more findings were fixed in place, one of them a behaviour change
    (GCP-27's fallback feedrate 25 to 50 mm/s). Since SP4.
    **Amended SP5:** budget one fix round per 5 reviewed cards of any kind (replacing this rule's 1 per 6
    and rule 12's 1 per 9 bugs), about 8 minutes of wall each, and start cards that consume a schema,
    validator or contract only after that card passes review. Evidence: SP5 5 rounds in 24 done cards,
    bugs 2 of 11 (PLT-189, GCP-93), new code 3 of 13 (GCP-45, GCP-38, and GCP-47 reworked after GCP-45's
    validator changed: GCP-46 and 47 were dispatched at 01:41 while GCP-45 was in review); wall 3.6 to
    12.3 minutes, median 7.2, for 0.5 to 1.4 agent-minutes each.
    **Amended SP6:** the rate held; budget about 15 minutes of wall a failed card under waves, two rounds
    for a card that parses hostile input (rule 25). Evidence: SP6 13 of 62 done cards failed first review
    (1 in 4.8), all new code (bugs 0 of 12); 14 fix agents; wall 2.7 to 28.4 min, median 14.8; PRF-8 and
    GCP-16 took two rounds each.
    **Amended SP7:** budget one fix round per 4 new-code cards (bugs still about none) and 25 minutes of
    wall each; a fix worker appends its Progress below the reviewer's FAIL text and never rewrites it.
    Evidence: SP7 8 of 31 done cards failed first review (1 in 3.9), all new code or chores, bugs 0 of 8;
    wall 7.2 to 50.6 min, median 23.7 (PLT-194 two rounds); fix workers twice overwrote the reviewer's
    FAIL text (coordinator).
    **Amended SP8:** budget by kind: features 2 in 3 fail first review and a quarter of those twice;
    bugs 1 in 3; chores, scaffolds and releases none. About 12 minutes of wall a round under alternating
    waves. A card that ports or parses an upstream format quotes, in its criteria, the upstream lines
    that define the behaviour (`repo@commit:path:line`), not only the project. Testable: features' first
    reviews fail at most 1 in 2 in the next sprint. Evidence: SP8 13 of 39 reviewed cards failed (1 in
    3.0): features 12 of 18, bugs 1 of 3 (PRF-180), chores 0 of 18; 19 rounds; PRF-125 (Cura's
    substring `exclude_materials`), PRF-24 (boost `ini_parser` headers, duplicates, ASCII trim) and
    PRF-10 (schema mapping) failed on upstream semantics the cards did not quote; a failed round cost 10
    to 12 minutes (PRF-180 FAIL 07:43, pass 07:52).
    **Amended SP9:** before moving a card to review, the worker runs the reviewer's mutation probe on each
    new test (remove the behaviour or bound it names; the test must fail) and records each probe in
    Progress. Testable: features fail first review at most 1 in 2. Evidence: SP9 features failed 9 of 12
    (target missed), bugs 3 of 14; most findings were tests that passed with their behaviour removed
    (PRF-89 size and depth, GCP-115 the counted read path, PLT-197 the fixture walk-up twice, VWR-49 the
    transfer, PRF-33 the ratio test). A round cost about 26 minutes in the large early waves (with the
    restart) and 5 to 8 in the small late ones (SLC-13 and PLT-197, two rounds in 22 to 26 minutes).
    **Amended SP10:** probing only the worker's own tests did not lower the rate. Before review, the worker
    probes every acceptance criterion and every guard or branch its diff adds (remove it; a test must fail),
    and names in Progress the platform the CI gate runs on. Budget one round per feature card: about 10 to 20
    minutes of wall under per-lane dispatch, about 4 for an S bug. Testable unchanged: features fail first
    review at most 1 in 2. Evidence: SP10 every feature card recorded probes (PRF-27 24, PRF-28 12), yet
    features failed 12 of 14 (bugs 3 of 9, chores 3 of 5), on what had no test at all: PRF-34's bed guard,
    four behaviours PRF-126 claimed, PRF-57's ticked activation criterion, PRF-67's VSIX packaging, GCP-42's
    budget calibrated on macOS and enforced on Linux.
20. **Commit each card when its review passes**, before another card that touches its files is
    dispatched. Cards in one module that run at the same time (rule 14) leave CHANGELOG, README,
    `index.ts`, `package.json` and the lockfile to the coordinator's release commit, and list their
    lines in Progress. Testable: each card's Done in `board.py retro` (read from git) is within 5
    minutes of its reviewer's move to done. Evidence: SP4 reviewers moved cards to done from 00:06:59
    to 00:49:26, but all were committed 00:43:30 to 00:44:47 (22 commits), split by file with "also
    carries" notes because PLT-39 changed PLT-187's and PLT-188's files, GCP-27 GCP-28's `bambu.ts`,
    and GCP-83, GCP-23 and GCP-82 all `klipper.ts`; the facts table's Done column read 00:43 for every
    card. Since SP4.
    **Amended SP5:** two cards that change the same hunks go to one lane agent in sequence and one commit
    with both tickets in the subject (`GCP-90, GCP-91: ...`). Evidence: SP5 18 of 24 cards committed
    within 5 minutes of the reviewer's done; GCP-90+91, PLT-190+191, GCP-32+33, GCP-92+93 and the GCP-89
    and GCP-95 preview parts each went in one commit, with two "also carries" notes left (SP4: 22 commits
    split by file).
21. **Workers never publish.** The coordinator publishes each module once per sprint, after the last
    card that changes it has passed review, then runs one clean-registry `run.mjs ci` (extends rule
    13 to every module). Testable: one version per module per sprint in `git log`. Evidence: SP4
    gcode-parser shipped 0.9.0 (GCP-83), 0.10.0 (GCP-84) and 0.10.1, because GCP-79 and GCP-18 changed
    its `package.json` after 0.10.0; the clean-registry ci failed lockfile integrity once and needed
    gcode-preview 0.2.1 too (`39a31c1`). Since SP4.
    **Amended SP5:** a card that creates a module copies the `prepack` build script from an existing
    module's `package.json`, and the coordinator commits each release before the clean-registry ci.
    Testable: the ci passes on its first run. Evidence: SP5 held one version per module (gcode-bgcode
    0.4.3, gcode-api 0.6.0, gcode-parser 0.11.0, webview-kit 0.5.1, gcode-planner 0.4.0, gcode-preview
    0.3.0, gcode-language 0.1.0), but the ci passed on the third run: gcode-language (GCP-43) had no
    `prepack`, then the version check wanted the change committed.
    **Amended SP6:** before publishing a module that gains a runtime dependency, run its consumers'
    notices and licence checks against the packed module; a dependency only some consumers need goes on a
    subpath export, not the main entry. Testable: one version per module and the ci passes on its first
    run. Evidence: SP6 gcode-parser 0.12.0 put `@vsslicer/3mf` (and saxes) in its main entry, the
    preview's notices check refused saxes's missing licence file, and GCP-111 shipped gcode-parser 0.13.0
    and gcode-preview 0.4.1 (`2b522ab`); the ci passed on its third run (stale pins, then the licence
    check's "Ported from" rule on two test files, `8453720`).
22. **Every agent prompt names a `mktemp -d` scratch directory**; agents delete only files they
    created there and use `command ls -1` (not the aliased `ls`) in scripts. The coordinator runs
    `git status --short` after each wave and restores any change outside the dispatched cards' files.
    Testable: zero stray-file incidents in the next retro. Evidence: SP4 had four in 55 agents: files
    named after `ls` output in a board folder (twice), a reviewer deleting another's note, `rm -rf
    /tmp/x` on a directory the reviewer did not create, and the GCP-82 fix worker overwriting its
    card. Since SP4.
    **Amended SP5:** reviewers write the review into the card before moving it, at the one path that
    `command ls -1 <board>/*/<n>-*.md` prints (stop if it prints none or two), and probe tests live only in
    the scratch directory, importing the module by absolute path. Evidence: SP5 four incidents in 51
    agents: review lines written to a literal `review/088-*.md` (unmatched glob) and to a stale
    `review/189-*.md` after the move, and probe tests left in gcode-planner's and gcode-preview's `test/`.
    **Amended SP6:** workers format only the files they changed (`prettier --write <their files>`, never
    a module), change their card only by appending under Progress, and a reviewer's last step is the
    `board.py move`. Evidence: SP6 workers ran `prettier --write` over whole modules, the VWR-2 worker
    truncated and rewrote its card, and the VWR-8 and GCP-34 reviewers passed without moving (the
    coordinator moved them, 03:42:37 and 04:05:34).
    **Amended SP7:** every prompt for a project-board card gives the `board.py --board <project>` form,
    workers report only in their final message (never by messaging another session), and every worker
    runs `node scripts/run.mjs checks` (licence headers, ported-copyright, package licence) before moving
    its card to review. Testable: the clean-registry ci fails on no finding that `checks` reports.
    Evidence: SP7 VSS-471 created on the VSS board for want of `--board`; the PRF-16 worker messaged the
    main session; ci run 4 failed on check-licence for PRF-16's test ("Ported from" without Copyright)
    and PRF-41's missing `license`, the same rule that failed SP6's third run (`8453720`).
    **Amended SP10:** the coordinator's own scripts follow the one-path rule (`command ls -1`, stop on none or
    two), and reviewers' mutation probes run in a `mktemp -d` copy of the module, never through git commands in
    the repository. Testable: zero incidents. Evidence: SP10 four incidents: the VWR-397 fix worker overwrote
    its card, the PRF-27 reviewer ran `git checkout -p` in a probe, a stray empty `vsslicer/CHANGELOG.md`, and
    the coordinator's `cat >> $(ls */034-*.md)` with two matches made a literal `034-*.md` that `board.py`
    then moved as PRF-34's card (`b7fdb9d2`).
23. **Capacity is the busiest lane.** A sprint lasts as long as its longest single-module chain: plan
    about 20 points an hour per lane with work (40 in a 2-hour sprint), give a hot module a second card
    on disjoint files (rule 14) where one exists, and keep an ordered pull-in list of next-sprint cards
    that are not owner- or dependency-blocked, pulled in as each lane frees. Testable: no sprint ends
    more than 15 minutes early while a workable card sits in the next sprint. Evidence: SP5 ended 81
    minutes early at 60 points an hour with a mean of 1.54 agents; after 01:52 only gcode-preview had
    work (GCP-31, 32+33, 35, 38 and the GCP-89 and GCP-95 preview parts, 01:13 to 02:09, 18 points an
    hour), while GCP-40, GCP-50 and GCP-97 were workable in SP6; only GCP-48 was pulled back. The trim
    used rule 5's estimate of 69 minutes for that chain; it took 56. Since SP5.
    **Amended SP6:** confirmed at 20 to 22 points an hour per lane; keep pulling in until the sprint's
    planned end, not until the planned cards are done. Evidence: SP6 3mf 22, mesh 22, profile-api 20,
    the gcode modules 20 (73.2 an hour); 74 points pulled in from SP7 as lanes freed, but no dispatch after
    04:32 and the sprint ended 56 minutes early with PRF-16 and PRF-17 workable since 04:13.
    **Amended SP8:** under wave dispatch count a lane in review cycles: a card that passes takes about 12
    minutes from dispatch to done whatever its size, and each expected fix round (rule 19) adds 12. Plan
    a lane at 5 cards an hour less one per expected round, and get points from many lanes (batch
    scaffolds several to an agent). Testable: each lane's done cards in the next sprint are within one of
    this estimate. Evidence: SP8 passing cards took a median 11.9 minutes (S 5.9 to 13.3, M 7.3 to 11.2);
    feature lanes ran 3.2 to 11.6 points an hour (profiles 11 in 57 min, profiles-prusa 9 in 71,
    profiles-cura 2 in 38), the five longest cards were long only by review rounds, and the sprint still
    made 65.4 an hour from about 25 lanes (16 scaffolds in 4 agents, 32 points in 12 minutes).
    **Amended SP9:** held where a lane had work all sprint (profiles-prusa 4 cards in 67 minutes against an
    estimate of 3 to 4), but the cycle follows wave size: about 15 minutes in waves of 9 or more agents,
    about 5 in waves of 6 or fewer. Plan 4 cards an hour per lane at sprint start. Evidence: SP9 passing
    cards' median 15.8 minutes in waves 1 and 2 (14.2 to 18.1), 7.8 and 10.3 in waves 5 and 6; other lanes
    ran dry or started late (slicer and tooling's second cards at 10:09 and 10:16 after the 09:22 re-plan).
    **Amended SP10:** with per-lane dispatch a lane with cards on disjoint files does about 5 to 6 cards an
    hour: plan 5 an hour per lane less one per expected round (rule 19). The coordinator dispatches every
    card whose dependencies are done until the planned end, keeping about 15 minutes for the audit and retro.
    Testable unchanged. Evidence: SP10 profiles-prusa 6 cards in 63 minutes (three at once, 11:49 to 12:16),
    profiles-cura 4 in 46, profiles-orca 3 in 61 (held by rounds); the sprint ended 62 minutes early with
    PRF-42, 52, 53, 54 and 127 (21 points) workable from 12:21 at the latest.
24. **Report delivered and closed points.** close-sprint counts every card whose `sprint` is the sprint
    at close, done or not, including the audit and retro cards and cards pulled in, and its committed
    figure moves with any re-sizing of carried cards before the close. Retros give both figures and
    calibrate on delivered points to the last card done. Testable: the retro's close figure equals the
    sprint doc's `completed`. Evidence: SP4 closed at 76 of 133 against the retro's 72 of 139 (VSS-43
    and VSS-78; four carried cards re-sized); SP5's retro expects 67 of 124 (63 plus VSS-44 and VSS-79).
    Since SP5.
    **Amended SP10:** a rebalance or re-plan does not run once the sprint's coordinator has started, and never
    moves a card in doing or review. Testable: no card's sprint changes while it is in doing. Evidence: SP10
    the 11:23:20 rebalance (`0202202b`) moved ten wave-1 cards (20 points) to SP31 and later 6 seconds after
    their 11:23:31 to 11:23:33 moves to doing; the coordinator set them back at 11:27:35, and the committed
    figure became 114 against the rebalance's 92.
25. **A card that parses untrusted input names its resource bounds at planning.** Size, nesting, count
    and time bounds, and linear-time scanning (no backtracking regex over input bytes), go in its
    acceptance criteria with a hostile-input test (bomb, deep nesting, unterminated tags, pathological
    pattern). Testable: at most one fix round in a sprint for a resource-bound finding. Evidence: SP6
    seven of thirteen failed first reviews, and one bug card, were missing bounds on hostile input: PRF-7 (nesting), VWR-5+6
    (zip bomb), PRF-8 (regex backtracking: a denylist and a step budget failed review, then an own
    Thompson NFA), VWR-8 (overlapping entries), VWR-15 (index wrap, XML depth), GCP-16 (quadratic regexes,
    two rounds), and VWR-389 from the VWR-37 spike at 20 M triangles. Since SP6.
    **Amended SP7:** the bounds cover every loop and copy in the card's code, not only the parser it
    names: generators and their tokenizers and line lookups, data copied across a process, worker or
    webview boundary (cap before inflating or copying), and concurrent requests (an in-flight cap, with
    later requests coalesced or refused). Testable unchanged: at most one resource-bound fix round in a
    sprint. Evidence: SP7 bounds were in the criteria before start (coordinator), yet four first reviews
    failed on resource bounds in paths they did not name: PRF-16 (quadratic and unbounded C++ tokenizer
    paths), PRF-17 (quadratic line lookup), GCP-36 (thumbnails inflated before the cap and copied to the
    host; unbounded plate loads), GCP-39 (unbounded request flood).
    **Amended SP8:** the coordinator checks every card before dispatch, pulled in or planned, and writes
    a Bounds criterion into any card that parses, scans, loops over or copies input and has none;
    numeric limits a caller passes (timeouts, sizes, counts) are validated as finite, positive and in
    range, and a fix keeps the cheap reject it optimises. Testable unchanged: at most one resource-bound
    round. Evidence: SP8 six resource-bound rounds: PRF-10 (regex backtracking), PRF-71 (quadratic index
    build) and PRN-131 twice (quadratic collisions), none of which named a bound in its criteria; SLC-9
    (unvalidated `timeoutMs`, an `onLine` throw escaping the stream listener); PRF-180 (the fix dropped
    the `text.length > max` reject).
    **Amended SP9:** written bounds cut the rounds from 6 to 4, not to one. A Bounds criterion names the
    hostile cases the review will build, not only the caps: for archives and file trees, symlink chains,
    Unicode and case aliases of a path component, overlapping entries, and caps that hold across every
    input of one call; and each bound's test is shown to fail with the bound removed (rule 19). Testable
    unchanged. Evidence: SP9 bounds in every card before dispatch (coordinator), yet SLC-13 failed twice (a
    symlink chain escape with an overlap bomb, then a Unicode alias of a parent), PRF-190 once (caps per
    tree, not across trees; a symlinked root), PRF-89 once (size and depth tests that could not fail).
    **Amended SP10:** the hostile cases also list check-then-open races (open once, then check the handle),
    file descriptors closed on every error path, and no full copy of input before its cap. Testable
    unchanged. Evidence: SP10 five rounds on four cards: PRF-27 (merge memory amplification), PRF-30 (a
    symlinked folder followed), SLC-280 twice (TOCTOU, then an fd leak), VWR-397 (a 2x buffer before the cap).
26. **Tests do not assert wall time.** A performance test asserts operation counts, a step budget or a
    ratio between two input sizes; a timeout exists only as a hang guard of at least 30 s. Testable: no
    timing flake in the next sprint's ci runs. Evidence: SP7 at machine load about 76, the 3mf fan-out
    (1 s), gcode-parser (500 ms) and a profile-api 5 s timeout flaked (coordinator), in the sprint in
    which PRF-178 made profile-api's regex timing tests load-independent. Since SP7.
    **Amended SP9:** a card that replaces wall-clock asserts names, per test, what replaces each assert
    (an operation count, a step budget or a size ratio) and which test carries the hang guard. Evidence:
    SP9 all three such cards failed first review on exactly that (VWR-395 guard on the wrong test, PRF-186
    timeouts below the guard, GCP-115 hang guards instead of counts, then a count on an unproven path),
    43 to 66 minutes for 2-point bugs.
27. **Agents record in the card file, and the record matches what shipped.** Worker and fix-worker
    prompts say "append under Progress in the card file with an edit"; `board.py note` writes only to
    the activity log and never counts as the record. A release card names its version after reading the
    registry's latest published version, and a dispatch uses the card's `model`. Testable: every fix
    round in the next sprint has the fix worker's lines in the card's Progress, and every release card's
    title matches the published version. Evidence: SP8 fix notes for PLT-51, PRN-131 and others reached
    only `activity.jsonl` (reviewers copied them in); PRF-136 planned `profile-api@0.2.0` and released
    0.1.1 because 0.1.0 already carried the increment, re-locking four dependents (coordinator); PRN-5
    (`model: opus`) was built by a Sonnet batch worker and failed first review. Since SP8.
28. **A failed review of a contract card writes the rule it expects into the card as a criterion**, the
    semantics and not only the fix, and a re-review checks the card against that criterion instead of
    deriving the rule again. A second failure on the same rule goes to the coordinator, who settles the
    rule in the card before the next fix is dispatched. Testable: no card fails three rounds on one rule.
    Evidence: SP9 PRN-4 (PrinterStatus `mergeStatus` truncations) failed three rounds: round 1 asked to keep
    base truncations whose top-level field the patch did not set, round 2 found that wrong for keyed lists
    and merged objects and specified a structural `replaces()` rule, round 3 failed on the truncation rule
    again; the specs conflicted across fresh reviewers (coordinator) and the card was carried. Since SP9.
    **Confirmed SP10:** with the rule settled in the card before its fix, PRN-4 passed its first re-review
    (fix 11:24:38, pass 11:31:14); the remaining findings became PRN-444, not another round.
29. **Dispatch prompts stay short and point to the sprint's standing rules files** (worker and review rules
    under `.ai/local/sp<n>/`), never spelling out "restore", "overwrite" or "do not touch" instructions, which
    the auto-mode permission classifier refuses. When a dispatch is refused twice, the coordinator records it
    and moves to another lane. The coordinator may re-review a card against the FAIL criterion written in it
    (rule 28), but a first review of a feature waits for a reviewer agent or carries, and the audit samples
    every card the coordinator reviewed. Testable: refusals counted in the retro notes, and no first review
    of a feature by the coordinator. Evidence: SP10 about 14 refusals ("Auto-Mode Bypass", once "Instruction
    Poisoning"), first on detailed prompts, from 12:04 on minimal ones too; PRF-34's fix waited 11.6 minutes
    after three refusals, GCP-118 left the sprint, PRF-29 carried; the coordinator reviewed 12 cards, 5 of
    them first reviews (4 passed, against 7 of 24 for fresh Opus reviewers). Since SP10.
