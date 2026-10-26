// SPDX-License-Identifier: AGPL-3.0-or-later
import { MAX_PATTERN_LENGTH } from '@vsslicer/profile-api';

/** Bounds on untrusted profile input: entries per list, characters per value, condition size. */
export const MAX_EXCLUDED_MATERIALS = 2000;
export const MAX_VALUE_LENGTH = 256;

export interface ConditionConversion {
  /** Unified `when` condition; undefined means "no restriction". */
  condition?: string;
  lossy: boolean;
  diagnostics: string[];
}

export interface QualityConversion extends ConditionConversion {
  /** Cura `quality_type`: the process identity, not a compatibility condition. */
  qualityType?: string;
  /** Cura `global_quality = True`: a printer-wide quality, matched by definition and quality_type only (MachineNode.py:258). */
  globalQuality: boolean;
}

/** Quotes a value as a unified-condition string literal; only the escapes the lexer knows are used. */
export function quoteLiteral(value: string): string {
  return `'${value.replace(/[\\'\n\t]/g, (c) => (c === '\n' ? '\\n' : c === '\t' ? '\\t' : `\\${c}`))}'`;
}

/** Uranium's `parseBool` (`Uranium@e65ccc1:UM/Util.py:12`), with Cura's default for an absent key. */
const parseBool = (v: unknown, absent: boolean): boolean =>
  v === undefined ? absent : ([true, 'True', 'true', 'Yes', 'yes', 1] as unknown[]).includes(v);

/** The machine flags that decide which quality metadata keys Cura looks up by. */
export interface CuraMachineFlags {
  hasMachineQuality: boolean;
  hasVariants: boolean;
  hasMaterials: boolean;
}

/**
 * A machine definition's `has_machine_quality` (default false), `has_variants` (default false) and `has_materials`
 * (default true), as `Cura@5bea2f8:cura/Machines/MachineNode.py:43-46` reads them. `meta` must be the definition's
 * metadata already resolved through its `inherits` chain: most machines get these keys from a parent.
 */
export function curaMachineFlags(meta: Readonly<Record<string, unknown>>): CuraMachineFlags {
  return {
    hasMachineQuality: parseBool(meta['has_machine_quality'], false),
    hasVariants: parseBool(meta['has_variants'], false),
    hasMaterials: parseBool(meta['has_materials'], true),
  };
}

/**
 * The `definition` a machine's qualities carry, which callers put in `printer.model` before evaluating
 * {@link convertQualityMetadata} output: the machine's `quality_definition` (default its own id) when
 * `has_machine_quality` is true, else `fdmprinter` (`Cura@5bea2f8:cura/Machines/MachineNode.py:45-46`,
 * `MaterialNode.py:73-90`). `meta` must be resolved through `inherits`, as for {@link curaMachineFlags}.
 */
export function curaQualityDefinition(machineId: string, meta: Readonly<Record<string, unknown>>): string {
  if (!curaMachineFlags(meta).hasMachineQuality) return 'fdmprinter';
  const q = meta['quality_definition'];
  return typeof q === 'string' ? q : machineId;
}

/**
 * Cura quality `[metadata]`/`[general]` (`definition`, `variant`, `material`, `quality_type`, `global_quality`) to
 * `printer.model == X and nozzle.id == '..' and material.base == '..'`, where `printer.model` is the machine's
 * {@link curaQualityDefinition}. Every present value is an exact match (Cura's registry lookups are equality
 * filters), but only the keys Cura looks up by on this machine become clauses (`Cura@5bea2f8:cura/Machines/MaterialNode.py:73-90`):
 * `variant` only with `has_variants`, `material` only with `has_materials`, and neither without `has_machine_quality`.
 * Absent fields add no clause. A present but unusable value (not a string, too long) is dropped with a diagnostic and lossy.
 */
export function convertQualityMetadata(
  meta: Readonly<Record<string, unknown>>,
  machine: CuraMachineFlags,
): QualityConversion {
  const diagnostics: string[] = [];
  const clauses: string[] = [];
  const take = (key: string): string | undefined => {
    const v = meta[key];
    if (v === undefined) return undefined;
    if (typeof v !== 'string' || v.length > MAX_VALUE_LENGTH) {
      diagnostics.push(`${key} is not a string of at most ${MAX_VALUE_LENGTH} characters`);
      return undefined;
    }
    return v;
  };
  const clause = (key: string, ref: string) => {
    const v = take(key);
    if (v !== undefined) clauses.push(`${ref} == ${quoteLiteral(v)}`);
  };
  clause('definition', 'printer.model');
  const byMaterial = machine.hasMachineQuality && machine.hasMaterials;
  if (byMaterial && machine.hasVariants) clause('variant', 'nozzle.id');
  if (byMaterial) clause('material', 'material.base');
  const qualityType = take('quality_type');
  return {
    ...(clauses.length > 0 && { condition: clauses.join(' and ') }),
    ...(qualityType !== undefined && { qualityType }),
    // MachineNode.py:258 filters on the string "True".
    globalQuality: meta['global_quality'] === 'True' || meta['global_quality'] === true,
    lossy: diagnostics.length > 0,
    diagnostics,
  };
}

/** Longest entry the evaluator's 200-character regex limit (`MAX_PATTERN_LENGTH`) leaves room for. */
const REGEX_FRAME = '.*(?:).*'.length;
/** Regex clauses per condition; the parser caps AST height at 64, and callers may `and` more onto it. */
export const MAX_REGEX_CLAUSES = 32;

/** Escapes the characters the `u`-flag regex syntax treats as syntax (`-` is not, and `\-` is a u-mode error). */
const escapeRegex = (s: string) => s.replace(/[\\^$.*+?()[\]{}|/]/g, '\\$&');

/**
 * Cura `exclude_materials: [...]` to `material.base !~` the substring regex `.*(?:a|b).*`, chunked into `and`ed clauses that each fit
 * the evaluator's regex length limit. Upstream an entry excludes every material whose id contains it as a substring
 * (`Cura@5bea2f8:cura/Machines/MachineNode.py:222-227`, called with the material `id`, `VariantNode.py:62-63`), so
 * `polymaker_` excludes `polymaker_pla`. shortcut: we test `material.base` (the base file id), which equals `id` for
 * base materials; an entry that only matches a printer-specific material id's suffix is missed; upgrade if one does.
 * Invalid or unfittable entries are dropped, lossy.
 */
export function convertExcludeMaterials(materials: readonly unknown[]): ConditionConversion {
  const diagnostics: string[] = [];
  const chunks: string[][] = [[]];
  let chunkLength = 0;
  let full = false;
  materials.forEach((m, i) => {
    if (i >= MAX_EXCLUDED_MATERIALS) {
      if (i === MAX_EXCLUDED_MATERIALS)
        diagnostics.push(`exclude_materials has more than ${MAX_EXCLUDED_MATERIALS} entries; the rest are ignored`);
      return;
    }
    if (full) return;
    if (typeof m !== 'string' || m.length === 0 || m.length > MAX_VALUE_LENGTH) {
      diagnostics.push(`exclude_materials[${i}] is not a non-empty string of at most ${MAX_VALUE_LENGTH} characters`);
      return;
    }
    const e = escapeRegex(m);
    if (e.length + REGEX_FRAME > MAX_PATTERN_LENGTH) {
      diagnostics.push(`exclude_materials[${i}] is too long for a ${MAX_PATTERN_LENGTH}-character regex`);
      return;
    }
    let chunk = chunks[chunks.length - 1]!;
    if (REGEX_FRAME + chunkLength + e.length > MAX_PATTERN_LENGTH) {
      if (chunks.length === MAX_REGEX_CLAUSES) {
        diagnostics.push(
          `exclude_materials needs more than ${MAX_REGEX_CLAUSES} regex clauses; remaining entries are ignored`,
        );
        full = true;
        return;
      }
      chunks.push((chunk = []));
      chunkLength = 0;
    }
    chunk.push(e);
    chunkLength += e.length + 1; // the entry and the '|' before the next one
  });
  const clauses = chunks.filter((c) => c.length > 0).map((c) => `material.base !~ /.*(?:${c.join('|')}).*/`);
  return {
    ...(clauses.length > 0 && { condition: clauses.join(' and ') }),
    lossy: diagnostics.length > 0,
    diagnostics,
  };
}
