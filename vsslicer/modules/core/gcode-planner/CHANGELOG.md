# Changelog

## 0.1.0

- GCP-19: planner contract. `MachineLimits` with `resolveLimits` (override, config block, flavour defaults; per-field source, `assumed` and `flavourAssumed` flags), `Planner`, `Timing` (start times in the move buffer, f64 per-layer, per-role and travel tables, checkpoints), `runPlanner` (AbortSignal, progress) and `planSync`, `MoveCursor`, `TimingBuilder`, and `constantSpeedPlanner`.
