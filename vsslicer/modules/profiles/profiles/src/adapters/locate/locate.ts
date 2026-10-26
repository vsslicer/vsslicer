// SPDX-License-Identifier: AGPL-3.0-or-later
import { posix, win32 } from 'node:path';
import type { DirectoryLister } from '../../application/file-system-port.ts';

export type SlicerId = 'prusaslicer' | 'superslicer' | 'orcaslicer' | 'bambustudio' | 'cura';
export type Platform = 'darwin' | 'win32' | 'linux';
export type Packaging = 'native' | 'flatpak' | 'snap';
/** `data` only for Cura on Linux, where profiles live apart from the preferences in `config`. */
export type FolderKind = 'config' | 'data';

export interface LocateInput {
  platform: Platform;
  home: string;
  /** Only APPDATA (Windows), XDG_CONFIG_HOME and XDG_DATA_HOME (Linux) are read. */
  env: Readonly<Record<string, string | undefined>>;
  fs: DirectoryLister;
}
export interface InstalledSlicer {
  slicer: SlicerId;
  packaging: Packaging;
  kind: FolderKind;
  /** Configuration or data folder (see `kind`); for Cura the newest-first versioned folder, e.g. `.../cura/5.7`. */
  path: string;
  /** Cura only. */
  version?: string;
}
export interface LocateDiagnostic {
  code: 'missing' | 'unreadable' | 'truncated';
  path: string;
  message: string;
}
export interface LocateResult {
  found: InstalledSlicer[];
  diagnostics: LocateDiagnostic[];
}

/** Cap on entries read from Cura's versioned root; a hostile or huge directory cannot grow the work. */
export const MAX_CURA_ENTRIES = 64;

// Folder names, Flatpak ids and Snap names per slicer.
// Confirmed against upstream clones in .reference/repos:
//  - PrusaSlicer 2.9 `PrusaSlicer`, SuperSlicer `SuperSlicer`, Orca `OrcaSlicer`, Bambu Studio `BambuStudio`
//    (PrusaSlicer-2.9@b028299:src/libslic3r/Utils/DirectoriesUtils.cpp:90-118, SuperSlicer@1f3d287:version.inc:7,
//    OrcaSlicer@09aa0114:version.inc:5, BambuStudio@79df7ae:version.inc:5).
//  - PrusaSlicer 3 uses `PrusaSlicer<major>`, `-dev` for alpha/beta
//    (PrusaSlicer@30ef591:src/slic3r-base/src/Slic3r/Directories.cpp:221-233, version.inc:6).
//  - Flatpak `com.prusa3d.PrusaSlicer` (PrusaSlicer@30ef591:README.md:13); Orca `com.orcaslicer.OrcaSlicer`
//    (OrcaSlicer@09aa0114:scripts/flatpak/com.orcaslicer.OrcaSlicer.yml:1) with legacy `io.github.softfever.OrcaSlicer`
//    (OrcaSlicer@09aa0114:src/slic3r/GUI/GUI_App.cpp:589-604).
//  - Cura config under XDG_CONFIG_HOME, profiles under XDG_DATA_HOME, both `cura/<major.minor>`
//    (Uranium@e65ccc1:UM/Resources.py:186-193,407-422,452-462,488-501; Cura@5bea2f8:cura/CuraApplication.py:461-470).
// Unverified (no upstream source cloned): Flatpak ids `com.github.supermerill.SuperSlicer`, `com.bambulab.BambuStudio`,
// `com.ultimaker.cura`; Snap names `prusa-slicer`, `cura-slicer` (PrusaSlicer's README lists Flathub only).
const DIR_NAMES: Record<SlicerId, string[]> = {
  prusaslicer: ['PrusaSlicer', 'PrusaSlicer3', 'PrusaSlicer3-dev'],
  superslicer: ['SuperSlicer'],
  orcaslicer: ['OrcaSlicer'],
  bambustudio: ['BambuStudio'],
  cura: ['cura'],
};
// Current id first.
const FLATPAK: Record<SlicerId, string[]> = {
  prusaslicer: ['com.prusa3d.PrusaSlicer'],
  superslicer: ['com.github.supermerill.SuperSlicer'],
  orcaslicer: ['com.orcaslicer.OrcaSlicer', 'io.github.softfever.OrcaSlicer'],
  bambustudio: ['com.bambulab.BambuStudio'],
  cura: ['com.ultimaker.cura'],
};
const SNAP: Partial<Record<SlicerId, string>> = { prusaslicer: 'prusa-slicer', cura: 'cura-slicer' };
const ORDER: SlicerId[] = ['prusaslicer', 'superslicer', 'orcaslicer', 'bambustudio', 'cura'];

interface Candidate {
  slicer: SlicerId;
  packaging: Packaging;
  kind: FolderKind;
  path: string;
}

function candidates({ platform, home, env }: Omit<LocateInput, 'fs'>): Candidate[] {
  const p = platform === 'win32' ? win32 : posix;
  let root: string;
  if (platform === 'darwin') root = p.join(home, 'Library', 'Application Support');
  else if (platform === 'win32') root = env['APPDATA'] || p.join(home, 'AppData', 'Roaming');
  else root = env['XDG_CONFIG_HOME'] || p.join(home, '.config');
  const out: Candidate[] = [];
  const add = (slicer: SlicerId, packaging: Packaging, kind: FolderKind, ...parts: string[]) =>
    out.push({ slicer, packaging, kind, path: p.join(...parts) });
  for (const slicer of ORDER) {
    for (const n of DIR_NAMES[slicer]) add(slicer, 'native', 'config', root, n);
    // Linux Cura keeps profiles in the data folder; the config folder holds only preferences.
    if (platform === 'linux' && slicer === 'cura')
      add(slicer, 'native', 'data', env['XDG_DATA_HOME'] || p.join(home, '.local', 'share'), 'cura');
  }
  if (platform === 'linux') {
    for (const slicer of ORDER) {
      for (const id of FLATPAK[slicer]) {
        const app = p.join(home, '.var', 'app', id);
        for (const n of DIR_NAMES[slicer]) add(slicer, 'flatpak', 'config', app, 'config', n);
        if (slicer === 'cura') add(slicer, 'flatpak', 'data', app, 'data', 'cura');
      }
      const snap = SNAP[slicer];
      if (snap) {
        const cur = p.join(home, 'snap', snap, 'current');
        for (const n of DIR_NAMES[slicer]) add(slicer, 'snap', 'config', cur, '.config', n);
        if (slicer === 'cura') add(slicer, 'snap', 'data', cur, '.local', 'share', 'cura');
      }
    }
  }
  return out;
}

const VERSION = /^(\d+)\.(\d+)$/;
const cmpVersionDesc = (a: string, b: string) => {
  const [am, an] = a.split('.').map(Number) as [number, number];
  const [bm, bn] = b.split('.').map(Number) as [number, number];
  return bm - am || bn - an;
};

/** Never throws: every failure becomes a diagnostic. */
export async function locateInstalledSlicers(input: LocateInput): Promise<LocateResult> {
  const p = input.platform === 'win32' ? win32 : posix;
  const found: InstalledSlicer[] = [];
  const diagnostics: LocateDiagnostic[] = [];
  const list = async (path: string): Promise<string[] | undefined> => {
    try {
      return await input.fs.listDirectory(path);
    } catch (e) {
      const missing = (e as { code?: unknown } | null)?.code === 'ENOENT';
      diagnostics.push({
        code: missing ? 'missing' : 'unreadable',
        path,
        message: missing ? 'folder does not exist' : `cannot read folder: ${String((e as Error)?.message ?? e)}`,
      });
      return undefined;
    }
  };
  for (const c of candidates(input)) {
    const entries = await list(c.path);
    if (!entries) continue;
    if (c.slicer !== 'cura') {
      found.push(c);
      continue;
    }
    if (entries.length > MAX_CURA_ENTRIES) {
      diagnostics.push({
        code: 'truncated',
        path: c.path,
        message: `only the first ${MAX_CURA_ENTRIES} of ${entries.length} entries were considered`,
      });
    }
    const versions = entries
      .slice(0, MAX_CURA_ENTRIES)
      .filter((e) => VERSION.test(e))
      .sort(cmpVersionDesc);
    for (const version of versions) found.push({ ...c, path: p.join(c.path, version), version });
  }
  return { found, diagnostics };
}
