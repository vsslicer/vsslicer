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

const MAX_TIMEOUT_SECONDS = 2_147_483;

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
  // runProcess accepts an integer 1..2^31-1 ms, so whole seconds in 1..2147483 keep seconds * 1000 valid.
  const timeoutSeconds = (v: unknown): number => {
    if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0) {
      warn(`vsslicer.slicer.timeout must be a positive number; using ${DEFAULTS.timeoutSeconds}.`);
      return DEFAULTS.timeoutSeconds;
    }
    const n = Math.min(MAX_TIMEOUT_SECONDS, Math.max(1, Math.round(v)));
    if (n !== v)
      warn(`vsslicer.slicer.timeout must be a whole number of seconds in 1..${MAX_TIMEOUT_SECONDS}; using ${n}.`);
    return n;
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
      timeoutSeconds: timeoutSeconds(timeout),
      outputFolder: str('outputFolder', DEFAULTS.outputFolder) || DEFAULTS.outputFolder,
    };
  };
};
