# Provenance: prusaslicer

Unmodified upstream samples, copied on 2026-10-25 from libbgcode (`https://github.com/prusa3d/libbgcode`, AGPL-3.0) commit `d4da9073616d70a43c151e8c1d7fbff879d2e08a`, `tests/data/`.

| File                          | Notes                                                                                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mini_cube_ps2.8.1.bgcode`    | PrusaSlicer 2.8.1, MK4S. CRC32, Deflate metadata, Heatshrink 12/4 + MeatPack-with-comments G-code, two thumbnails (QOI, PNG).                                       |
| `mini_cube_b.bgcode`          | libbgcode test file, CRC32, Deflate slicer metadata, Heatshrink 12/4 G-code (10 blocks), thumbnails.                                                                |
| `mini_cube_b_ref.gcode`       | Unmodified libbgcode reference text G-code of `mini_cube_b.bgcode` (same commit, `tests/data/`); used to check comment lines survive in the decoded MeatPack bytes. |
| `mini_cube_ps2.8.1_ref.gcode` | Unmodified libbgcode reference text G-code of `mini_cube_ps2.8.1.bgcode` (same commit, `tests/data/`); the MeatPack decoder test compares against it.               |
