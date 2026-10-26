// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Dialect } from './project/project.ts';

export interface DialectGuess {
  readonly dialect: Dialect;
  /** The `Application` metadata as written, kept for unknown writers too. */
  readonly application?: string;
}

/** Last version the slicer's legacy (2.x) loader parses: PrusaSlicer@30ef591:src/slic3r-shared/src/Slic3r/Biz/Format/3mf/Model3mf.cpp:150. */
const LAST_PRUSA2: readonly [number, number, number] = [2, 99, 1];

/** `true` when a `PrusaSlicer-<version>` version is <= 2.99.1 (Model3mf.cpp:916-930); an unparsable version is not old. */
function isPrusa2Version(version: string): boolean {
  // Linear: one anchored match, no nested quantifiers.
  const m = /^(\d{1,9})\.(\d{1,9})(?:\.(\d{1,9}))?(?:-|\+|$)/.exec(version);
  if (!m) return false;
  // Patch is optional and defaults to 0, at most three parts: PrusaSlicer@30ef591:bundled_deps/semver/semver.c:182-211.
  const v = [Number(m[1]), Number(m[2]), Number(m[3] ?? 0)];
  for (let i = 0; i < 3; i++) if (v[i] !== LAST_PRUSA2[i]) return v[i]! < LAST_PRUSA2[i]!;
  return true; // equal to 2.99.1, or 2.99.1-alpha, which sorts below it
}

/**
 * Names the writer of a package from the root model's metadata and the part names, with no further reads. Rules, from
 * the slicers' own readers: `BambuStudio-`/`OrcaSlicer-` prefix of `Application` (OrcaSlicer@09aa0114:
 * src/libslic3r/Format/bbs_3mf.cpp:4174-4181), the Orca-only `OrcaSlicer` metadata tag (:4182, :199) which marks Orca
 * files that still carry a `BambuStudio-` Application, `PrusaSlicer-` with the 2.99.1 cut-off
 * (PrusaSlicer@30ef591:...Model3mf.cpp:150, 916-930), `Metadata/PrusaSlicer3_project.json`
 * (...ProjectFileConstants.hpp:7), `Metadata/Slic3r_PE.config` (PrusaSlicer-2.9@b028299:src/libslic3r/Format/3mf.cpp:92)
 * and the `Cura/` folder (Cura@5bea2f8:plugins/3MFReader/ThreeMFWorkspaceReader.py:221). Anything else is `core`.
 *
 * The `Cura/` folder is checked first and wins over `Application`: Cura writes `getApplicationDisplayName()` but keeps an
 * `Application` it loaded from another slicer's file (ThreeMFReader.py:271-272, ThreeMFWriter.py:323-326), so a re-saved
 * Bambu/Orca/Prusa file carries a foreign `Application` next to `Cura/` parts.
 */
export function detectDialect(metadata: ReadonlyMap<string, string>, partNames: Iterable<string>): DialectGuess {
  const application = metadata.get('Application');
  // OPC part names are case-insensitive and may carry a leading `/` (see opcEdit.ts).
  const names = new Set<string>();
  for (const n of partNames) names.add((n.startsWith('/') ? n.slice(1) : n).toLowerCase());
  const found = (dialect: Dialect): DialectGuess =>
    application === undefined ? { dialect } : { dialect, application };

  for (const n of names) if (n.startsWith('cura/')) return found('cura');
  if (application?.startsWith('BambuStudio-')) return found(metadata.has('OrcaSlicer') ? 'orca' : 'bambu');
  if (application?.startsWith('OrcaSlicer-')) return found('orca');
  if (application?.startsWith('PrusaSlicer-'))
    return found(isPrusa2Version(application.slice('PrusaSlicer-'.length)) ? 'prusa2' : 'prusa3');
  if (names.has('metadata/prusaslicer3_project.json')) return found('prusa3');
  if (names.has('metadata/slic3r_pe.config')) return found('prusa2');
  if (metadata.has('OrcaSlicer')) return found('orca');
  return found('core');
}
