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

## Architecture rules

- **All code lives in `vsslicer/`.** Only files a tool requires at the repository root stay there,
  kept thin and pointing into `vsslicer/`: `.github/workflows/*.yml` and the root `LICENSE`.
  Research, plans and boards stay outside it.
- **Every capability is its own independent module** in `vsslicer/modules/<name>/`: the G-code
  core, the toolhead simulator, each slicer engine adapter, each printer connector, the viewer,
  profiles, filament, and so on. A module is a self-contained project:
  - its own `package.json`, lockfile, version, changelog, tests and build.
    `cd vsslicer/modules/<name> && pnpm install && pnpm test && pnpm build` works with nothing else built.
  - its own CI job and its own release (`<name>@x.y.z`), so it can be published alone, to npm,
    Open VSX or the VSSlicer marketplace, or moved to its own repository unchanged.
  - other modules only through declared semver ranges on their published packages, never relative
    imports, path aliases or reaching into another module's files.
- **Contracts are modules too.** A boundary several modules share (the slicer port, the printer
  port, the G-code model) lives in its own small `*-api` module. Adapters depend on that, never
  on each other: `slicer-orca` and `slicer-prusa` depend on `slicer-api`; `printer-moonraker` and
  `printer-bambu` on `printer-api`.
- **Shared tooling is a versioned module** (`tooling`: TypeScript base config, ESLint config with
  the layer-boundary rule, test setup), consumed as a dev dependency. There is no root workspace
  and no root lockfile. A thin script in `vsslicer/scripts/` runs a command in every module in
  dependency order.
- **Modular, SOLID and KISS, Clean architecture.** Every package is split into layers whose
  dependencies point inward only:
  - `domain`: entities and value objects. Pure, with no I/O and no framework.
  - `application`: use cases, and the ports (interfaces) they need from the outside.
  - `adapters`: the file system, processes, network, workers and engines, implementing those ports.
  - `presentation`: VS Code activation, commands, views and webviews.
- **The VS Code API appears only in `presentation`.** Domain and application code runs and is
  tested in plain Node, without VS Code, so it can serve other hosts (a CLI, the daemon) unchanged.
- **One reason to change per module.** Code depends on interfaces at real boundaries, and new
  behaviour comes through new adapters, not edits to the core.
- **KISS beats speculative abstraction.** A port exists because there's a real boundary with two
  sides today, not "for later". Prefer the plain function to the framework.
- **An import-boundary lint enforces the layers.** It fails CI when an inner layer imports an
  outer one. A rule broken on purpose must fail the lint.
- Every task card names the package and layer its code belongs to. Split a card that mixes layers.

## Sprint cycle

Every sprint runs `.ai/skills/sprint-cycle`: finish the sprint's tasks (including the bugfix cards
from the previous sprint's audit), run the audit (`.ai/audits/SP<n>-audit.md`, by a fresh Opus agent
that wrote none of the sprint's code), turn its findings into bugfix cards in the next sprint, hold the retro (`.ai/retros/SP<n>-retro.md`:
on time or not, why, and what changes in `.ai/plans/estimation.md`), then
`close-sprint SP<n> --next SP<n+1>`, which refuses to close without the audit and the retro and
starts the next sprint. Planners size cards with `.ai/plans/estimation.md`. Each sprint's "SP<n>: audit review and bugfix" card on the VSS board tracks steps 2 and 3.

## Build and test

Run from `vsslicer/` (Node 24, pnpm 11). Modules need the local registry (D12):

- `scripts/registry.sh start|stop|status`: Verdaccio on `http://localhost:4873`.
- `node scripts/run.mjs ci`: every module in dependency order: install, lint, build, test, publish.
- `node scripts/run.mjs test` (or `build`, `install`, `publish`): that step in every module.
- `--changed <git-ref>` on any of them: only changed modules and their dependents.
- One module standalone: `cd modules/<name> && pnpm install && pnpm test && pnpm build`.
- Runner tests: `cd vsslicer/scripts && node --test test/`.

## Conventions

- Tasks live on the board in `.ai/kanban` (taskboard, `~/Workspace/taskboard`: its Claude Code plugin gives agents
  the board's MCP tools, and the `taskboard` command does the same in a shell). Ticket IDs are `VSS-<n>`, and commit
  subjects start with theirs. One commit per finished, verified task. Agents move cards with the tools (passing their
  agent name), never by editing column lists; run `taskboard check` before committing board changes. People reorder
  and prioritise on the dashboard: the taskboard VS Code extension, whose background runner also runs the sprint loop.
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
- DCO: every commit needs a `Signed-off-by` trailer (owner decision Q12, CONTRIBUTING.md). Until the
  first-push history rewrite (which also adds sign-offs to the existing history and removes
  profiles-data-orca's vendored data, Q21), commits need not carry one: the rewrite adds them.
- Push only when asked. There is no remote yet.
- Notes and logs under `.ai/local/` (ignored) or `.reference/notes/` (ignored).

## Skills, agents, plans

- `.ai/skills/sprint-cycle`: how a sprint runs, from its tasks to the audit, the next sprint's
  bugfix cards, and close.
- `.ai/skills/slicer-research`: how a research task runs: clone, analyse, take notes, report.
- `.ai/agents/vsslicer-reviewer.agent.md`: reviews research reports and plans for unsourced
  claims, missing coverage and licence risks.
- `.ai/plans/roadmap.md`: the implementation roadmap, written from the research.
- `.ai/plans/estimation.md`: how to size cards, calibrated by every sprint retro.
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
