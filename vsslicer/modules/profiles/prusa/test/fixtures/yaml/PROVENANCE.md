# Provenance: yaml

Hand-written, minimal fixture that mimics the structure of a PrusaSlicer 3.0 `vendor.yaml`
(`resources/presets/prusa-research-fff/PrusaResearch/vendor.yaml` of PrusaSlicer@30ef591, AGPL-3.0): a `---`
stream of `kind:` documents, a comment-only document, a compact `- key: v` sequence at its parent's column, a
flow sequence, quoted ids, a trailing `#` comment on a plain scalar, and `|`/`|-` block scalars (used by the
`preset-*.yaml` files at that commit). Not copied from upstream; written for this repository, AGPL-3.0-or-later.
