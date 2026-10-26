# Cura tuple fixtures (PRF-129)

Test data only; not shipped (`files` in package.json lists `dist` only).

Cut from `Cura@5bea2f8:resources/` (commit 2026-10-09): the 123 files the 22 tuples in
`../golden/cura.json` reach (each machine and extruder definition with its whole `inherits` chain, the
nozzle variant, the extruder and global quality), copied unmodified at their upstream paths by
`../cura_oracle.py`. The user containers are synthetic and live in the golden file (Cura ships none).

Licence: LGPL-3.0, as the Cura repository. Data only; no Cura code is copied or run.

`../golden/cura.json` is the hand merge of these files by `cura_oracle.py` (Python, written from the
Uranium@e65ccc1 and Cura@5bea2f8 sources it cites). Regenerate both from the module folder with
`python3 -I test/tuples/cura_oracle.py <Cura resources> test/tuples/fixtures test/tuples/golden/cura.json`;
CI never runs it.
