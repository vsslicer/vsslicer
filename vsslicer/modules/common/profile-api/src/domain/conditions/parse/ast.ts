// SPDX-License-Identifier: AGPL-3.0-or-later
// AST of the `when` condition language (docs/research/profiles.md §6 "Conditions").

export const NAMESPACES = ['printer', 'nozzle', 'surface', 'feeder', 'material', 'process'] as const;
export type Namespace = (typeof NAMESPACES)[number];

export type Scalar = string | number | boolean;

/** Every node records the source offset it starts at, for diagnostics. Compare, match and in nodes start at their left operand; and/or nodes at their keyword; not at its keyword. */
interface At {
  offset: number;
}

export interface Literal extends At {
  kind: 'literal';
  value: Scalar;
}

/** `printer.features.chamber` → namespace `printer`, path `['features', 'chamber']`. */
export interface Ref extends At {
  kind: 'ref';
  namespace: Namespace;
  path: string[];
}

export type Operand = Literal | Ref;

export type CompareOp = '==' | '!=' | '<' | '<=' | '>' | '>=';

export interface Compare extends At {
  kind: 'compare';
  op: CompareOp;
  left: Operand;
  right: Operand;
}

/** `x =~ /re/` (negated: `x !~ /re/`). `pattern` is the regex source between the slashes. */
export interface Match extends At {
  kind: 'match';
  negated: boolean;
  subject: Operand;
  pattern: string;
}

/** `x in [a, b]` or `'TAG' in printer.tags` (negated: `not in`). */
export interface In extends At {
  kind: 'in';
  negated: boolean;
  item: Operand;
  set: Literal[] | Ref;
}

export interface Not extends At {
  kind: 'not';
  operand: Expr;
}

export interface Logical extends At {
  kind: 'and' | 'or';
  left: Expr;
  right: Expr;
}

/** A bare operand is a truth test, e.g. `nozzle.high_flow`. */
export type Expr = Operand | Compare | Match | In | Not | Logical;

export class ConditionParseError extends Error {
  override name = 'ConditionParseError';
  readonly offset: number;
  constructor(message: string, offset: number) {
    super(`${message} at offset ${offset}`);
    this.offset = offset;
  }
}
