// SPDX-License-Identifier: AGPL-3.0-or-later
// The `vsslicer` task type: definition schema and validation of tasks.json entries. No VS Code import.
export const TASK_TYPE = 'vsslicer';
export const TASK_KINDS = ['slice', 'upload', 'print'] as const;
export type TaskKind = (typeof TASK_KINDS)[number];

/** Properties each kind accepts, beyond the generic task keys. `required` ones must be present. */
export const TASK_PROPERTIES: Readonly<Record<TaskKind, { required: readonly string[]; optional: readonly string[] }>> =
  {
    slice: {
      required: ['plate', 'printerProfile', 'filamentProfile', 'processProfile'],
      optional: ['engine'],
    },
    upload: { required: ['printer'], optional: [] },
    print: { required: ['printer'], optional: [] },
  };

/** Keys VS Code itself allows on any task entry (vscode@4ef6bab7:src/vs/workbench/contrib/tasks/common/jsonSchema_v2.ts:431-455). */
const GENERIC_KEYS = [
  'type',
  'task',
  'label',
  'detail',
  'group',
  'problemMatcher',
  'presentation',
  'dependsOn',
  'isBackground',
  'promptOnClose',
  'icon',
  'hide',
  'options',
  'runOptions',
  'dependsOrder',
  'identifier',
  'inAgents',
];
const ENGINES = ['orca', 'prusa', 'cura'];
const MAX_KEYS = 64;
const MAX_STRING = 512;

export type TaskValidation = { ok: true; kind: TaskKind } | { ok: false; errors: string[] };

/** Validates one tasks.json entry. Rejects unknown properties. Never throws. */
export function validateTaskEntry(entry: unknown): TaskValidation {
  if (typeof entry !== 'object' || entry === null || Array.isArray(entry))
    return { ok: false, errors: ['task: not an object'] };
  const keys = Object.keys(entry);
  if (keys.length > MAX_KEYS) return { ok: false, errors: [`task: more than ${MAX_KEYS} properties`] };
  const e = entry as Record<string, unknown>;
  if (e.type !== TASK_TYPE) return { ok: false, errors: [`type: must be "${TASK_TYPE}"`] };
  const kind = TASK_KINDS.find((k) => k === e.task);
  if (kind === undefined) return { ok: false, errors: [`task: must be one of ${TASK_KINDS.join(', ')}`] };

  const spec = TASK_PROPERTIES[kind];
  const errors: string[] = [];
  for (const k of keys)
    if (!GENERIC_KEYS.includes(k) && !spec.required.includes(k) && !spec.optional.includes(k))
      errors.push(`${k}: unknown property for ${kind}`);
  for (const k of spec.required) if (e[k] === undefined) errors.push(`${k}: required for ${kind}`);
  for (const k of [...spec.required, ...spec.optional]) {
    const v = e[k];
    if (v === undefined) continue;
    const ok =
      k === 'plate'
        ? Number.isInteger(v) && (v as number) >= 1
        : typeof v === 'string' && v.length > 0 && v.length <= MAX_STRING;
    if (!ok) errors.push(`${k}: invalid value`);
  }
  if (e.engine !== undefined && !ENGINES.includes(e.engine as string))
    errors.push('engine: must be orca, prusa or cura');
  return errors.length > 0 ? { ok: false, errors } : { ok: true, kind };
}
