# Task-board tooling for gstack-driven work

Researched 2026-10-25. Requirements: (1) live agent activity, (2) milestones and a roadmap
view, (3) sprints with burndown, (4) docs and decisions linked to tasks, (5) built to work
with gstack (v1.91.216.0, `~/.claude/skills/gstack`).

## How gstack tracks work itself

gstack has no board. Its skills share three on-disk formats:

- **`TODOS.md`** at the repo root, specified in `gstack/review/TODOS-format.md`: `## <Component>`
  sections, `### <Title>` items with What / Why / Context / Effort (S–XL) / Priority (P0–P4) /
  Depends on, and a `## Completed` section. `/ship`, `/review`, `/retro`, `/autoplan`,
  `/plan-ceo-review`, `/plan-design-review`, `/office-hours`, `/investigate`, `/qa`,
  `/qa-only` and `/design-review` all read or write it. `/retro` computes backlog metrics
  from it: open count, P0/P1 count, items completed and added in the period.
- **Plan-review task JSONL**: `~/.gstack/projects/<slug>/tasks-<phase>-<ts>.jsonl`, with the
  fields phase, run_id, branch, commit, id, priority, component, files, effort, title and
  source_finding. `/autoplan` aggregates them (`gstack/scripts/resolvers/tasks-section.ts`).
- **Timeline**: `~/.gstack/projects/<slug>/timeline.jsonl`, with skill started/completed
  events (`gstack/bin/gstack-timeline-log`).

Upstream won't add a board. Issue [#247](https://github.com/garrytan/gstack/issues/247)
asked for one and was closed. PR [#2095](https://github.com/garrytan/gstack/pull/2095) was a
read-only sprint dashboard built from TODOS.md, CHANGELOG, git and timeline data, and
maintainers closed it on 2026-10-03: "We aren't accepting new standalone skills right now."

## Candidates

| Tool | 1 Live agents | 2 Milestones/roadmap | 3 Sprints/burndown | 4 Docs/decisions | 5 gstack | Licence, activity | Storage |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [Backlog.md](https://github.com/MrLesk/Backlog.md) | No | Milestones with due dates; roadmap requested in [#730](https://github.com/MrLesk/Backlog.md/issues/730) (open) | No (no mention in README or CLI docs) | Yes: `doc`, `decision` | No | MIT, 7.1k stars, v1.55.3, pushed 2026-10-23 | Markdown in git, CLI/MCP/web; wants its CLI to own the files |
| [botlanes](https://github.com/developdaly/botlanes) | Partial: cards light up when an agent needs input | No | No | No | **Yes**: one column per gstack skill; dragging a card runs that skill | **No licence**, 9 stars, last push 2026-03-28 | Its own server state |
| [claude-code-kanban](https://github.com/NikiforovAll/claude-code-kanban) | **Yes**: subagents with model, status, run time, prompt/response; session log | No | No | No | No | MIT, 80 stars, pushed 2026-10-24 | Reads Claude Code's own per-session task files and transcripts |
| [disler hooks observability](https://github.com/disler/claude-code-hooks-multi-agent-observability), [agents-observe](https://github.com/simple10/agents-observe) | Yes, via hook events | No | No | No | No | (unverified) | SQLite / event stream |
| [Vibe Kanban](https://landscape.jimmysong.io/projects/vibe-kanban/) | Runs agents in worktrees | No | No | No | No | Company reportedly shut down Apr 2026; community-maintained (unverified) | Its own DB |
| Taskmaster AI | No | Task trees from a PRD | No | No | No | ([comparison](https://aicoolies.com/comparisons/vibe-kanban-vs-taskmaster-ai)) | JSON |
| Your kanban skill | No | Milestone swimlanes, initiative/epic levels; no dates or timeline | No | No | No | Yours | Markdown in git, local dashboard, durable change inbox |

No tool meets all five. botlanes is the only one built for gstack, but it has no licence (so
reusing it isn't legal), has been dormant for seven months, and launches its own agents, which
would compete with our coordinator.

## Recommendation: a new gstack-native skill, built on your kanban skill

Keep what already works (Markdown cards in git, the dashboard, the durable inbox) and add the
missing parts as views over data that already exists, so there's little new state to keep
consistent.

- **Live agent activity.** Claude Code `SubagentStart`/`SubagentStop` hooks (check
  `SubagentStart` against the hooks docs before relying on it) append to
  `.ai/local/kanban/activity.jsonl`: agent ID, card, model, start, stop, status. Each card's
  notes file (`.reference/notes/VSS-<n>-*.md`) gives the latest progress line, and its mtime
  shows stall: no write in N minutes means stalled. Merge gstack's `timeline.jsonl` into the
  same feed.
- **Milestones and roadmap.** `.ai/kanban/milestones/M<n>-<slug>.md`, with goal, start, due
  and status in front matter. A roadmap view draws them on a timeline, with progress taken
  from their cards.
- **Sprints and burndown.** `.ai/kanban/sprints/S<n>.md`, with start, end, milestone and the
  committed cards. The burndown comes from `git log` of card moves into `done/`, so nothing
  extra is stored. Velocity is summed effort per sprint.
- **Docs and decisions.** A `docs:` card field linking `docs/research/*.md`, plus
  `.ai/kanban/decisions/D<n>-<slug>.md` (ADR shape). Both get a view next to the board.
- **gstack bridge.** A sync script, so gstack's skills see the board without changing them:
  - Board → `TODOS.md`: open cards rendered in TODOS-format, grouped by the `area` field,
    finished cards under Completed. `/ship`, `/review` and `/retro` then read the board as
    their backlog.
  - gstack → board: new `### items` that a skill adds to TODOS.md, and `/autoplan`'s
    `tasks-*.jsonl`, become Backlog cards.
  - A column-to-skill map in `board.yml` (optional, like botlanes), so moving a card to
    "Eng review" can run `/plan-eng-review` on it.
- **Head start.** PR #2095's loaders for gstack state (`lib/dashboard-data.ts`) were offered to
  an MIT repository and are worth reading before writing our own. Whether we can reuse the
  code depends on its licence on that branch (unverified).

**Alternative:** use Backlog.md as the data layer and add the bridge and activity view
around it. That gets docs, decisions and milestones for free, but it adds a CLI that wants to
own every file, still has no sprints, roadmap or live agents, and means migrating the VSS
board in the middle of a sprint.

## Open questions

- Where the new skill lives: your skills repo next to `kanban` (reusable), or
  project-local in `.ai/skills/` first.
- Whether moving a card into a column may start a gstack skill on its own, or only suggest it.
