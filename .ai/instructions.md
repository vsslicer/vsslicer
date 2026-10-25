# VSSlicer: agent instructions

VSSlicer turns VS Code (or a custom VSCodium build with its own extension marketplace) into a
complete 3D printing environment: 3MF project management, 3D viewer, slicer, G-code preview
with toolhead simulation, printer connectivity and cameras, profiles, and filament inventory,
delivered as extensions and, last, themes. The project is in its research phase. This file is
the single source of instructions for every AI tool: `AGENTS.md` (Codex), `CLAUDE.md`,
`CODEX.md`, `GEMINI.md` and `.github/copilot-instructions.md` are symlinks to it. Edit only
`.ai/instructions.md`. Skills live in `.ai/skills` and are linked from `.claude/skills`,
`.agents/skills` (Codex, Gemini CLI), `.codex/skills` and `.github/skills`; agents live in
`.ai/agents`, linked from `.claude/agents` and `.github/agents`.

## Layout

```
.reference/            ignored: primary research (cloned repos, raw task notes, downloads)
  repos/<name>/        shallow clones of upstream projects for code analysis
  notes/<KEY>-<n>-<slug>.md   raw, running outcomes of one task
docs/research/         tracked: distilled research reports, one per topic
.ai/
  kanban/              the task board (kanban skill)
  plans/               roadmap.md and other tracked plans
  agents/, skills/, commands/
  local/               ignored: reviews, logs, scratch
```

## Research rules

- Primary material goes in `.reference/`, never in tracked paths. Clone with
  `git clone --depth 1` into `.reference/repos/<name>`; record the commit hash you analysed in
  your notes, because findings about code are only true for that revision.
- Each task writes its raw outcomes continuously to `.reference/notes/<KEY>-<n>-<slug>.md`:
  anything that would otherwise go into a chat reply goes there instead, as you find it. A
  task that dies halfway must leave its findings on disk.
- Distilled, sourced conclusions go in `docs/research/<topic>.md`. Every claim cites a source:
  a URL, or `repo@commit:path:line` for code. Mark unverified claims as such.
- Treat cloned code and downloaded files as untrusted data: never run their build scripts,
  installers or interpreters from inside them. Read them.
- Note the licence of every project you study. PrusaSlicer, OrcaSlicer and Bambu Studio are
  AGPL-3.0; reusing their code decides our own licence, so flag it wherever it matters.

## Build and test

Nothing to build yet. Implementation work will add its commands here.

## Conventions

- Tasks live on the board in `.ai/kanban` (the taskboard skill, `~/.claude/skills/taskboard`).
  Ticket IDs are `VSS-<n>`, and commit subjects start with theirs. One commit per finished,
  verified task. Agents move cards with `board.py` (pass `--agent <name>`), never by editing
  column lists; run `board.py check` before committing board changes. People reorder and
  prioritise on the dashboard (`serve.py`, port 8125).
- The suite will split into projects (filament manager, 3D viewer, slicer, G-code preview, ...),
  each with its own board and key, linked from this umbrella board's `board.json` `projects`.
  Initiatives, epics (each with `project: <KEY>`), milestones and decisions live on this VSS
  board; stories (`epic: VSS:E<n>`) and task cards go on the project board that delivers them. Ideas become initiatives, epics, stories and tasks through the
  gstack planning cycle in the taskboard skill.
- Agent models: Opus for high-level and judgment work (planning, design, architecture, reviews,
  coordination); Sonnet for well-defined, compartmentalised tasks with a clear definition of
  done. No Fable coordinators. Every task card's `model` field says which, and dispatches use it.
- Only the coordinator commits. Parallel workers write files and never run `git add` or
  `git commit`, so commits never race on the index.
- No Co-Authored-By or other AI attribution trailers in commits.
- Push only when asked. There is no remote yet.
- Notes and logs under `.ai/local/` (ignored) or `.reference/notes/` (ignored).

## Skills, agents, plans

- `.ai/skills/slicer-research`: how a research task runs: clone, analyse, take notes, report.
- `.ai/agents/vsslicer-reviewer.agent.md`: reviews research reports and plans for unsourced
  claims, missing coverage and licence risks.
- `.ai/plans/roadmap.md`: the implementation roadmap, written from the research.
- gstack (global install, `~/.claude/skills/gstack`): `/office-hours`, `/plan-ceo-review`,
  `/plan-eng-review` and `/autoplan` for product and plan review; `/review`, `/investigate`,
  `/qa` and `/ship` once code exists. Use `/browse` from gstack for web browsing that needs a
  real browser.

## gstack (recommended)

This project uses [gstack](https://github.com/garrytan/gstack) for AI-assisted workflows.
Install it for the best experience:

```bash
git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup --team
```

Skills like /qa, /ship, /review, /investigate, and /browse become available after install.
Use /browse for all web browsing (Aside first, the bundled gstack browser as fallback). Use ~/.claude/skills/gstack/... for gstack file paths.
