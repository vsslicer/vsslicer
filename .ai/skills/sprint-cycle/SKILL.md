---
name: sprint-cycle
description: How a VSSlicer sprint runs from start to close, ending with an automatic audit whose findings become the next sprint's bugfix cards and a retro that calibrates future estimates. Use when coordinating, finishing or closing a sprint, or starting the next one.
---

# Sprint cycle

One coordinator (Opus) runs one sprint. The board is the taskboard skill
(`~/.claude/skills/taskboard/SKILL.md`); pass `--agent <name>` to every `board.py` call.

1. **Finish the sprint's tasks.** Every card with `sprint: VSS:SP<n>` (or `SP<n>` on the VSS board),
   including the bugfix cards the previous sprint's audit created. Work them in dependency order,
   each on the model its card names, with independent verification and one commit per card.
   Cards blocked only on an owner answer may carry over; nothing else does.
2. **Run the audit.** When every task card is done or blocked, dispatch a fresh Opus agent that wrote
   none of this sprint's code. It runs `/ponytail:ponytail-audit` over the modules the sprint
   changed (`git diff --stat <sprint's first commit>..HEAD -- vsslicer/`) and saves the report as
   `.ai/audits/SP<n>-audit.md`. The audit changes no code. A sprint that changed no code still gets
   a one-line report saying so.
3. **Create the bugfix cards.** Each finding becomes a `type: bug` card on the board of the module
   it's in, in the next sprint (`sprint=VSS:SP<n+1>`), linking the report (`docs=`), with
   `model=sonnet` unless the fix needs design judgment:
   - must fix: `priority=P0`
   - should fix: `priority=P1`
   - nice to have: `priority=P2`
   Record the card tickets in the report under a closing "Cards" section, and in the
   "SP<n>: audit review and bugfix" card's Progress, then move that card to Done.
4. **Hold the retro.** A fresh Opus agent (it may be the auditor) runs `board.py retro SP<n>` and
   writes `.ai/retros/SP<n>-retro.md`:
   - the facts table from the command, unedited
   - **on time or not:** planned vs actual pace and overrun, and which cards ran long or short
     against their effort, by effort, model and type
   - **why:** for each card that ran well over or under its size, the cause (scope bigger than the
     card said, waiting on a dependency, verification failing and looping, owner question, model
     too weak or more than needed, tooling problems, parallelism limits), from its notes file, its
     Progress, the verifier's report and git history; and for the sprint as a whole, where the time
     went (sequential chains, too little parallelism, coordination overhead, carried cards)
   - **change:** concrete, testable adjustments to estimation (re-size a kind of card, split
     rules, model choice, parallelism the coordinator should use), each written into
     `.ai/plans/estimation.md` under "Rules learned" with its evidence
   - **re-sizing:** cards in the next sprints whose effort no longer fits the rules, re-sized with
     `board.py set` (owner-facing scope is unchanged)
   The retro changes no code. Move the "SP<n>: retro" card to Done with a two-line summary.
5. **Close and begin.** `board.py close-sprint SP<n> --next SP<n+1>`. It refuses until
   `.ai/audits/SP<n>-audit.md` and `.ai/retros/SP<n>-retro.md` exist (board.json `sprint_close.requires`), carries unfinished cards
   over, archives the finished ones and starts SP<n+1>. Commit it as `Board: close SP<n>`. Reply
   with the result; whoever started you then starts the coordinator for SP<n+1>.

## Traps

- The audit is step 2, not a background task. Start it only when the sprint's code is final, or it
  audits code that changes after.
- Bugfix cards go to the next sprint even when they look small. The current sprint closes on time;
  its fixes are the next sprint's first work, ahead of its planned cards (priority P0 sorts first).
- Commit only your own paths (`git commit -m ... -- <paths>`): other coordinators may share the checkout.
