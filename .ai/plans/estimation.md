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
