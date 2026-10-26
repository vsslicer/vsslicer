// SPDX-License-Identifier: AGPL-3.0-or-later
// Recursive descent over:
//   or      := and ('or' and)*
//   and     := not ('and' not)*
//   not     := ('not' | '!') not | primary
//   primary := '(' or ')' | operand [ cmp operand | ('=~' | '!~') regex | ['not'] 'in' set ]
//   operand := number | string | 'true' | 'false' | namespace '.' name ('.' name)*
//   set     := '[' [literal (',' literal)*] ']' | ref
import {
  ConditionParseError,
  NAMESPACES,
  type CompareOp,
  type Expr,
  type Literal,
  type Namespace,
  type Operand,
} from './ast.ts';
import { lex, type Token } from './lexer.ts';

const COMPARE: readonly string[] = ['==', '!=', '<', '<=', '>', '>='] satisfies CompareOp[];
/** Limits on untrusted vendor conditions. */
export const MAX_SOURCE_LENGTH = 64 * 1024;
export const MAX_DEPTH = 64;
const KEYWORDS = new Set(['and', 'or', 'not', 'in']);

/** Parses a `when` condition. Throws {@link ConditionParseError} with the offset of the fault. */
export function parseCondition(src: string): Expr {
  if (src.length > MAX_SOURCE_LENGTH)
    throw new ConditionParseError(`Condition longer than ${MAX_SOURCE_LENGTH} characters`, MAX_SOURCE_LENGTH);
  const tokens = lex(src);
  // Bounds recursion in the parser and in every AST walker (PRF-8's evaluator): `depth` is the live nesting of
  // '(' and 'not'; `height` is the AST height, which long and/or chains grow even without nesting.
  let depth = 0;
  const heights = new WeakMap<object, number>();
  const tooDeep = (offset: number): never => {
    throw new ConditionParseError('Condition nested too deeply', offset);
  };
  const h = (e: Expr): number => heights.get(e) ?? 0;
  const node = <T extends Expr>(n: T, ...kids: Expr[]): T => {
    const height = 1 + Math.max(0, ...kids.map(h));
    if (height > MAX_DEPTH) tooDeep(n.offset);
    heights.set(n, height);
    return n;
  };
  let pos = 0;
  const peek = (): Token => tokens[pos]!;
  const next = (): Token => tokens[pos++]!;
  const isPunct = (t: Token, ...texts: string[]) => t.kind === 'punct' && texts.includes(t.text);
  const isWord = (t: Token, word: string) => t.kind === 'name' && t.text === word;
  const fail = (t: Token, what: string): never => {
    throw new ConditionParseError(`Expected ${what} but found ${describe(t)}`, t.offset);
  };

  const or = (): Expr => {
    let left = and();
    while (isWord(peek(), 'or')) {
      const { offset } = next();
      const right = and();
      left = node({ kind: 'or', left, right, offset }, left, right);
    }
    return left;
  };
  const and = (): Expr => {
    let left = not();
    while (isWord(peek(), 'and')) {
      const { offset } = next();
      const right = not();
      left = node({ kind: 'and', left, right, offset }, left, right);
    }
    return left;
  };
  const not = (): Expr => {
    const t = peek();
    if (isWord(t, 'not') || isPunct(t, '!')) {
      next();
      if (++depth > MAX_DEPTH) tooDeep(t.offset);
      const operand = not();
      depth--;
      return node({ kind: 'not', operand, offset: t.offset }, operand);
    }
    return primary();
  };
  const primary = (): Expr => {
    if (isPunct(peek(), '(')) {
      if (++depth > MAX_DEPTH) tooDeep(peek().offset);
      next();
      const inner = or();
      depth--;
      if (!isPunct(next(), ')')) fail(tokens[pos - 1]!, "')'");
      return inner;
    }
    const left = operand();
    const t = peek();
    if (t.kind === 'punct' && COMPARE.includes(t.text)) {
      next();
      return { kind: 'compare', op: t.text as CompareOp, left, right: operand(), offset: left.offset };
    }
    if (isPunct(t, '=~', '!~')) {
      next();
      const re = next();
      if (re.kind !== 'regex') return fail(re, 'a /regex/');
      return { kind: 'match', negated: isPunct(t, '!~'), subject: left, pattern: re.pattern, offset: left.offset };
    }
    const negated = isWord(t, 'not') && isWord(tokens[pos + 1]!, 'in');
    if (negated || isWord(t, 'in')) {
      pos += negated ? 2 : 1;
      return { kind: 'in', negated, item: left, set: set(), offset: left.offset };
    }
    return left;
  };
  const set = (): Literal[] | Extract<Operand, { kind: 'ref' }> => {
    if (!isPunct(peek(), '[')) {
      const ref = operand();
      return ref.kind === 'ref' ? ref : fail(tokens[pos - 1]!, "'[' or a reference");
    }
    next();
    const items: Literal[] = [];
    while (!isPunct(peek(), ']')) {
      if (items.length > 0 && !isPunct(next(), ',')) fail(tokens[pos - 1]!, "',' or ']'");
      const item = operand();
      if (item.kind !== 'literal') fail(tokens[pos - 1]!, 'a literal in the list');
      items.push(item as Literal);
    }
    next();
    return items;
  };
  const operand = (): Operand => {
    const t = next();
    if (t.kind === 'number' || t.kind === 'string') return { kind: 'literal', value: t.value, offset: t.offset };
    if (t.kind !== 'name' || KEYWORDS.has(t.text)) return fail(t, 'a value or a reference');
    if (isPunct(peek(), '(')) throw new ConditionParseError('Function calls are not allowed', t.offset);
    if (t.text === 'true' || t.text === 'false') return { kind: 'literal', value: t.text === 'true', offset: t.offset };
    const [namespace, ...path] = t.text.split('.');
    if (!NAMESPACES.includes(namespace as Namespace) || path.length === 0) {
      throw new ConditionParseError(
        `Unknown reference '${t.text}'; references start with one of ${NAMESPACES.join(', ')}`,
        t.offset,
      );
    }
    return { kind: 'ref', namespace: namespace as Namespace, path, offset: t.offset };
  };

  const expr = or();
  if (peek().kind !== 'eof') fail(peek(), "'and', 'or' or the end");
  return expr;
}

function describe(t: Token): string {
  switch (t.kind) {
    case 'eof':
      return 'the end';
    case 'name':
    case 'punct':
      return `'${t.text}'`;
    case 'number':
      return `number ${t.value}`;
    case 'string':
      return 'a string';
    case 'regex':
      return 'a regex';
  }
}
