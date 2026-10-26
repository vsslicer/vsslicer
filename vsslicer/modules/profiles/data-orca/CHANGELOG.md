# Changelog

## Unreleased

- PRF-190: `data/` is generated before pack from the pinned upstream commits (`scripts/generate.mjs`) and no longer tracked (Q21); bounded copy (no symlinks, 50,000 files, 16 MiB per file, 256 MiB in total).
- Orca (14,420 files) and Bambu (3,589 files) JSON trees, pinned.
