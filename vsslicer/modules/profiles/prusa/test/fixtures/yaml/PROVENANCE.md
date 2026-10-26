# Provenance: yaml

Hand-written, minimal fixture that mimics the structure of a PrusaSlicer 3.0 `vendor.yaml`
(`resources/presets/prusa-research-fff/PrusaResearch/vendor.yaml` of PrusaSlicer@30ef591, AGPL-3.0): a `---`
stream of `kind:` documents, a comment-only document, a compact `- key: v` sequence at its parent's column, a
flow sequence, quoted ids, a trailing `#` comment on a plain scalar, and `|`/`|-` block scalars (used by the
`preset-*.yaml` files at that commit). Not copied from upstream; written for this repository, AGPL-3.0-or-later.

`preset-print.yaml` is likewise hand-written for this repository (AGPL-3.0-or-later), mimicking the shape of a
PrusaSlicer@30ef591 `preset-*.yaml`: `kind`, quoted `id`, `values`, `variants` nested two levels with
`condition`, `id`, `match_mode`, an empty `values:`, and a second document with `name`, `inherits`,
`unconditional_inherits`, `features` and a `|-` block scalar. No upstream data copied.
