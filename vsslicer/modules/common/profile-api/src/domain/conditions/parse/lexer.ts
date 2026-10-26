// SPDX-License-Identifier: AGPL-3.0-or-later
import { ConditionParseError } from './ast.ts';

export type Token =
  | { kind: 'name'; text: string; offset: number }
  | { kind: 'number'; value: number; offset: number }
  | { kind: 'string'; value: string; offset: number }
  | { kind: 'regex'; pattern: string; offset: number }
  | { kind: 'punct'; text: Punct; offset: number }
  | { kind: 'eof'; offset: number };

export type Punct = '(' | ')' | '[' | ']' | ',' | '==' | '!=' | '<=' | '>=' | '<' | '>' | '=~' | '!~' | '!';

// Longest first, so `<=` wins over `<`.
const PUNCT: readonly Punct[] = ['==', '!=', '<=', '>=', '=~', '!~', '<', '>', '!', '(', ')', '[', ']', ','];
const NAME = /[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*/y;
const NUMBER = /-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/y;
const ESCAPES: Record<string, string> = { n: '\n', t: '\t', '\\': '\\', "'": "'", '"': '"' };

export function lex(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const sticky = (re: RegExp): string | undefined => {
    re.lastIndex = i;
    return re.exec(src)?.[0];
  };
  while (true) {
    while (i < src.length && /\s/.test(src[i]!)) i++;
    if (i >= src.length) break;
    const c = src[i]!;
    const prev = tokens.at(-1);
    if (c === '/' && prev?.kind === 'punct' && (prev.text === '=~' || prev.text === '!~')) {
      tokens.push(lexRegex(src, i));
      i = endOfRegex(src, i);
      continue;
    }
    if (c === "'" || c === '"') {
      const [value, end] = lexString(src, i);
      tokens.push({ kind: 'string', value, offset: i });
      i = end;
      continue;
    }
    const num = sticky(NUMBER);
    if (num !== undefined) {
      tokens.push({ kind: 'number', value: Number(num), offset: i });
      i += num.length;
      continue;
    }
    const name = sticky(NAME);
    if (name !== undefined) {
      tokens.push({ kind: 'name', text: name, offset: i });
      i += name.length;
      continue;
    }
    const punct = PUNCT.find((p) => src.startsWith(p, i));
    if (punct !== undefined) {
      tokens.push({ kind: 'punct', text: punct, offset: i });
      i += punct.length;
      continue;
    }
    if (c === '=') throw new ConditionParseError("Assignment '=' is not allowed; use '=='", i);
    throw new ConditionParseError(`Unexpected character '${c}'`, i);
  }
  tokens.push({ kind: 'eof', offset: src.length });
  return tokens;
}

function lexString(src: string, start: number): [string, number] {
  const quote = src[start];
  let out = '';
  for (let i = start + 1; i < src.length; i++) {
    const c = src[i]!;
    if (c === quote) return [out, i + 1];
    if (c === '\\') {
      const e = src[++i];
      const mapped = e === undefined ? undefined : ESCAPES[e];
      if (mapped === undefined) throw new ConditionParseError('Unknown escape in string', i - 1);
      out += mapped;
    } else out += c;
  }
  throw new ConditionParseError('Unterminated string', start);
}

/** Offset just past the closing `/` of the regex starting at `start`; `\/` does not close it. */
function endOfRegex(src: string, start: number): number {
  for (let i = start + 1; i < src.length; i++) {
    if (src[i] === '\\') i++;
    else if (src[i] === '/') return i + 1;
  }
  throw new ConditionParseError('Unterminated regular expression', start);
}

function lexRegex(src: string, start: number): Token {
  const pattern = src.slice(start + 1, endOfRegex(src, start) - 1);
  try {
    new RegExp(pattern); // validate only: a bad pattern is a parse error, not an evaluation-time surprise
  } catch (e) {
    throw new ConditionParseError(`Invalid regular expression: ${(e as Error).message}`, start);
  }
  return { kind: 'regex', pattern, offset: start };
}
