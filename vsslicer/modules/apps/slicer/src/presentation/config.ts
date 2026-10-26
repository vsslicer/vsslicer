// SPDX-License-Identifier: AGPL-3.0-or-later
// Thin settings adapter. Takes a getter, not the VS Code API, so it runs in plain node tests.
export const ENGINES = ['orca', 'prusa', 'cura'] as const;
export type EngineId = (typeof ENGINES)[number];

export interface SlicerSettings {
  engine: EngineId;
  orcaPath: string;
  curaPath: string;
  timeoutSeconds: number;
  outputFolder: string;
}

export type Getter = (key: string) => unknown;

const DEFAULTS: SlicerSettings = {
  engine: 'orca',
  orcaPath: '',
  curaPath: '',
  timeoutSeconds: 600,
  outputFolder: '.vsslicer/sliced',
};

/** Reads every setting; an invalid value falls back to its default and is reported once per distinct problem. */
export const createSettingsReader = (get: Getter, report: (problem: string) => void) => {
  const seen = new Set<string>();
  const warn = (p: string): void => {
    if (!seen.has(p)) {
      seen.add(p);
      report(p);
    }
  };
  const str = (key: string, def: string): string => {
    const v = get(key);
    if (v === undefined) return def;
    if (typeof v === 'string') return v;
    warn(`vsslicer.slicer.${key} must be a string; using the default.`);
    return def;
  };
  return (): SlicerSettings => {
    const engine = get('engine');
    const timeout = get('timeout');
    return {
      engine: ENGINES.includes(engine as EngineId)
        ? (engine as EngineId)
        : (warn(`vsslicer.slicer.engine must be one of ${ENGINES.join(', ')}; using ${DEFAULTS.engine}.`),
          DEFAULTS.engine),
      orcaPath: str('orca.path', DEFAULTS.orcaPath),
      curaPath: str('cura.path', DEFAULTS.curaPath),
      timeoutSeconds:
        typeof timeout === 'number' && Number.isFinite(timeout) && timeout > 0
          ? timeout
          : (warn(`vsslicer.slicer.timeout must be a positive number; using ${DEFAULTS.timeoutSeconds}.`),
            DEFAULTS.timeoutSeconds),
      outputFolder: str('outputFolder', DEFAULTS.outputFolder) || DEFAULTS.outputFolder,
    };
  };
};
