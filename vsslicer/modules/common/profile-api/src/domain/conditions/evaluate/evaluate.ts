// SPDX-License-Identifier: AGPL-3.0-or-later
// Evaluates a parsed `when` condition. Failure semantics follow PrusaSlicer 2.9, observed (not copied) at
// PrusaSlicer-2.9@b028299:src/libslic3r/Preset.cpp:399-406 (any runtime_error -> "compatible with everything")
// and PlaceholderParser.cpp:565,573,744,903 (type mismatch / unknown variable throw; regex_match is a FULL match).
// Regexes run on our own NFA matcher (regex.ts), so no pattern can backtrack catastrophically.
// Behaviour only, no AGPL code reused; this module is AGPL-3.0-or-later regardless.
import { ConditionParseError, type Expr, type Namespace, type Operand, type Scalar } from '../parse/ast.ts';
import { parseCondition } from '../parse/index.ts';
import { compileRegex } from './regex.ts';

export type ContextValue = Scalar | readonly Scalar[] | { readonly [key: string]: ContextValue };
export type ConditionContext = Partial<Record<Namespace, { readonly [key: string]: ContextValue }>>;

export interface EvalResult {
  compatible: boolean;
  /** Set when parsing or evaluating failed; `compatible` is then `true`, as in PrusaSlicer. */
  diagnostic?: string;
}

/** Raised inside the evaluator for unknown keys and type mismatches; never escapes {@link evaluate}. */
export class ConditionEvalError extends Error {
  override name = 'ConditionEvalError';
  readonly offset: number;
  constructor(message: string, offset: number) {
    super(`${message} at offset ${offset}`);
    this.offset = offset;
  }
}

export const MAX_PATTERN_LENGTH = 200;
export const MAX_SUBJECT_LENGTH = 512;
export { MAX_REGEX_STATES } from './regex.ts';

const compileCache = new Map<string, (subject: string) => boolean>();
function compile(pattern: string, offset: number): (subject: string) => boolean {
  let re = compileCache.get(pattern);
  if (re) return re;
  if (pattern.length > MAX_PATTERN_LENGTH)
    throw new ConditionEvalError(`Regex longer than ${MAX_PATTERN_LENGTH} characters`, offset);
  try {
    re = compileRegex(pattern);
  } catch (e) {
    throw new ConditionEvalError((e as Error).message, offset);
  }
  if (compileCache.size > 500) compileCache.clear();
  compileCache.set(pattern, re);
  return re;
}

const typeOf = (v: unknown): string => (Array.isArray(v) ? 'list' : typeof v);

function resolve(op: Operand, ctx: ConditionContext): ContextValue {
  if (op.kind === 'literal') return op.value;
  let cur: ContextValue | undefined = ctx[op.namespace];
  for (const seg of op.path) {
    if (cur === undefined || cur === null || typeof cur !== 'object' || Array.isArray(cur) || !Object.hasOwn(cur, seg))
      cur = undefined;
    else cur = (cur as { readonly [key: string]: ContextValue })[seg];
    if (cur === undefined) break;
  }
  if (cur === undefined || cur === null)
    throw new ConditionEvalError(`Unknown key '${op.namespace}.${op.path.join('.')}'`, op.offset);
  return cur;
}

function scalarOf(op: Operand, ctx: ConditionContext): Scalar {
  const v = resolve(op, ctx);
  if (typeof v === 'object') throw new ConditionEvalError(`Expected a scalar but got ${typeOf(v)}`, op.offset);
  return v;
}

function bool(e: Expr, ctx: ConditionContext): boolean {
  switch (e.kind) {
    case 'literal':
    case 'ref': {
      const v = scalarOf(e, ctx);
      if (typeof v !== 'boolean') throw new ConditionEvalError(`Not a boolean expression (got ${typeOf(v)})`, e.offset);
      return v;
    }
    case 'not':
      return !bool(e.operand, ctx);
    case 'and':
    case 'or': {
      // Both sides always, as PrusaSlicer-2.9@b028299:src/libslic3r/PlaceholderParser.cpp:735-746: an error on
      // either side fails the whole condition, whatever the operand order.
      const l = bool(e.left, ctx);
      const r = bool(e.right, ctx);
      return e.kind === 'and' ? l && r : l || r;
    }
    case 'compare': {
      const l = scalarOf(e.left, ctx);
      const r = scalarOf(e.right, ctx);
      if (typeof l !== typeof r)
        throw new ConditionEvalError(`Cannot compare ${typeOf(l)} with ${typeOf(r)}`, e.offset);
      if (e.op === '==') return l === r;
      if (e.op === '!=') return l !== r;
      if (typeof l !== 'number') throw new ConditionEvalError(`'${e.op}' needs numbers, got ${typeOf(l)}`, e.offset);
      const n = r as number;
      return e.op === '<' ? l < n : e.op === '<=' ? l <= n : e.op === '>' ? l > n : l >= n;
    }
    case 'match': {
      const s = scalarOf(e.subject, ctx);
      if (typeof s !== 'string') throw new ConditionEvalError(`Regex needs a string, got ${typeOf(s)}`, e.offset);
      if (s.length > MAX_SUBJECT_LENGTH)
        throw new ConditionEvalError(`Regex subject longer than ${MAX_SUBJECT_LENGTH} characters`, e.offset);
      return compile(e.pattern, e.offset)(s) !== e.negated;
    }
    case 'in': {
      const item = scalarOf(e.item, ctx);
      let set: readonly Scalar[];
      if (Array.isArray(e.set)) set = e.set.map((l) => l.value);
      else {
        const v = resolve(e.set, ctx);
        if (!Array.isArray(v)) throw new ConditionEvalError(`Expected a list but got ${typeOf(v)}`, e.set.offset);
        set = v;
      }
      for (const m of set)
        if (typeof m !== typeof item)
          throw new ConditionEvalError(`Cannot compare ${typeOf(item)} with ${typeOf(m)}`, e.offset);
      return set.includes(item) !== e.negated;
    }
  }
}

/** Evaluates a condition (source or parsed). Never throws: any parse or evaluation fault yields `{compatible: true, diagnostic}`. */
export function evaluate(expr: string | Expr, context: ConditionContext): EvalResult {
  try {
    return { compatible: bool(typeof expr === 'string' ? parseCondition(expr) : expr, context) };
  } catch (e) {
    if (e instanceof ConditionParseError || e instanceof ConditionEvalError)
      return { compatible: true, diagnostic: e.message };
    return { compatible: true, diagnostic: `Internal error: ${e instanceof Error ? e.message : String(e)}` };
  }
}
