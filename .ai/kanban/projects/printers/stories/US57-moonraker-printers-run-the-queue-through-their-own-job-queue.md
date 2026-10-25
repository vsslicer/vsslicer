---
id: US57
title: "Moonraker printers run the queue through their own job queue"
status: reviewed
epic: VSS:E47
---

As a Klipper user with Moonraker, I want queued items for my printer to use Moonraker's native job queue, so that the printer keeps its queue even if VS Code closes.

## Acceptance criteria

- [ ] The Moonraker session lists, adds, removes, starts, pauses and jumps jobs in `server/job_queue/*` (contract tests against recorded fixtures: `status`, `job`, `start`, `pause`, `jump`)
- [ ] `notify_job_queue_changed` updates the item state; the native queue is the truth when the two disagree
- [ ] Other families dispatch from the agent: upload through the upload queue, then start
- [ ] Only Moonraker on fixtures (D5)

## Out of scope

- Native queues of other families.
- Editing Moonraker's queue outside VSSlicer items.
