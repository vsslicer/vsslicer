// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Diagnostic } from '@vsslicer/profile-api';

/** Input cap; the pinned vendor.yaml is 22 KB and the largest pinned preset file 76 KB. */
export const MAX_YAML_BYTES = 8 * 1024 * 1024;
/** Deepest collection nesting (block and flow together). */
export const MAX_YAML_DEPTH = 64;
/** Nodes (scalars, maps, sequences) over the whole stream; reaching it stops the parse. */
export const MAX_YAML_NODES = 1_000_000;
/** Longest scalar in UTF-16 units. */
export const MAX_YAML_SCALAR = 1024 * 1024;
/** Diagnostics kept. */
export const MAX_YAML_DIAGNOSTICS = 1_000;

/** Why a YAML diagnostic was raised; the subset's refusals are named so a caller can tell them apart. */
export type YamlReason =
  | 'too-large'
  | 'too-deep'
  | 'too-many-nodes'
  | 'scalar-too-long'
  | 'invalid-utf8'
  | 'unterminated-quote'
  | 'bad-escape'
  | 'anchor'
  | 'alias'
  | 'tag'
  | 'merge-key'
  | 'complex-key'
  | 'directive'
  | 'document-end'
  | 'folded-scalar'
  | 'block-indicator'
  | 'multi-line-scalar'
  | 'multi-line-flow'
  | 'tab-indent'
  | 'duplicate-key'
  | 'syntax'
  /** vendor reader: the experimental flag is off. */
  | 'experimental-off'
  /** vendor reader: a document without a known `kind`, without an id, or a duplicate. */
  | 'bad-record'
  /** preset reader: more variants in one file than MAX_PRESET_VARIANTS. */
  | 'too-many-variants';

export interface YamlDiagnostic extends Diagnostic {
  reason: YamlReason;
}

export type YamlScalarStyle = 'plain' | 'single' | 'double' | 'literal';
export interface YamlScalar {
  kind: 'scalar';
  /** Verbatim for plain (`0.20` stays `0.20`, `null` stays `null`), unescaped for quoted; `''` for an empty value, like ryml's `val()`. */
  value: string;
  style: YamlScalarStyle;
  line: number;
}
export interface YamlSeq {
  kind: 'seq';
  items: YamlNode[];
  line: number;
}
export interface YamlEntry {
  key: string;
  line: number;
  value: YamlNode;
}
export interface YamlMap {
  kind: 'map';
  /** File order, duplicates kept (each warned); {@link yamlGet} returns the first, as ryml `find_child` does. */
  entries: YamlEntry[];
  line: number;
}
export type YamlNode = YamlScalar | YamlSeq | YamlMap;

export interface YamlDocument {
  /** 1-based line of the `---` (or 1 for an implicit first document). */
  line: number;
  /** `undefined` for a comment-only document or one dropped on an error. */
  root: YamlNode | undefined;
}

export interface YamlStream {
  documents: YamlDocument[];
  diagnostics: YamlDiagnostic[];
  /** Work done: nodes built and characters scanned. Tests bound these instead of time. */
  stats: { nodes: number; steps: number };
}

/** First value under `key`, or undefined; matches ryml `find_child` (YamlAdapterRyml.cpp:179-198). */
export function yamlGet(node: YamlNode | undefined, key: string): YamlNode | undefined {
  return node?.kind === 'map' ? node.entries.find((e) => e.key === key)?.value : undefined;
}

/** Scalar text of `node`, or undefined when it is a collection or absent (YamlAdapterRyml.cpp:129-138). */
export function yamlScalar(node: YamlNode | undefined): string | undefined {
  return node?.kind === 'scalar' ? node.value : undefined;
}

class Fail extends Error {
  readonly reason: YamlReason;
  readonly line: number;
  readonly fatal: boolean;
  constructor(reason: YamlReason, line: number, message: string, fatal = false) {
    super(message);
    this.reason = reason;
    this.line = line;
    this.fatal = fatal;
  }
}

const SP = 32;
const TAB = 9;
const HASH = 35;
const ESCAPES: Record<string, string> = {
  n: '\n',
  t: '\t',
  r: '\r',
  '0': '\0',
  '\\': '\\',
  '"': '"',
  '/': '/',
  ' ': ' ',
};

/**
 * Reads the YAML subset the PrusaSlicer@30ef591 preset tree uses: a `---` separated stream of block maps and
 * sequences (compact `- key: v` included), single-line flow `[]`/`{}`, plain, single- and double-quoted
 * scalars, literal block scalars (`|`, `|-`, `|+`) and `#` comments. Scalars stay strings, as upstream's
 * `scalar_value` returns them. Anchors, aliases, tags, merge keys, `?` keys, directives, `...`, folded
 * scalars and multi-line flow or plain scalars are refused with a named diagnostic; the document that holds
 * one is dropped and parsing resumes at the next `---`. One pass over the lines; every scan moves forward.
 */
export function parseYaml(input: string | Uint8Array, file: string): YamlStream {
  const documents: YamlDocument[] = [];
  const diagnostics: YamlDiagnostic[] = [];
  const stats = { nodes: 0, steps: 0 };
  const diag = (severity: Diagnostic['severity'], reason: YamlReason, line: number | undefined, message: string) => {
    if (diagnostics.length > MAX_YAML_DIAGNOSTICS) return;
    if (diagnostics.length === MAX_YAML_DIAGNOSTICS) message = 'further diagnostics suppressed';
    diagnostics.push({
      severity,
      code: 'malformed-line',
      reason,
      file,
      ...(line === undefined ? {} : { line }),
      message,
    });
  };
  const out = { documents, diagnostics, stats };

  const bytes = typeof input === 'string' ? Buffer.byteLength(input) : input.byteLength;
  if (bytes > MAX_YAML_BYTES) {
    diag('error', 'too-large', undefined, `input is ${bytes} bytes, over the ${MAX_YAML_BYTES} byte limit; not read`);
    return out;
  }
  let text: string;
  try {
    text = typeof input === 'string' ? input : new TextDecoder('utf-8', { fatal: true }).decode(input);
  } catch {
    diag('error', 'invalid-utf8', undefined, 'input is not valid UTF-8; not read');
    return out;
  }
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  // Line table: start, end (CR stripped), indent column, content start. Typed arrays keep a newline flood small.
  let count = 1;
  for (let i = text.indexOf('\n'); i >= 0; i = text.indexOf('\n', i + 1)) count++;
  const lstart = new Int32Array(count);
  const lend = new Int32Array(count);
  const indent = new Int32Array(count);
  const cstart = new Int32Array(count); // == lend for a blank line
  for (let n = 0, pos = 0; n < count; n++) {
    let end = text.indexOf('\n', pos);
    if (end < 0) end = text.length;
    const next = end + 1;
    if (end > pos && text.charCodeAt(end - 1) === 13) end--;
    let a = pos;
    while (a < end && text.charCodeAt(a) === SP) a++;
    stats.steps += a - pos + 1;
    lstart[n] = pos;
    lend[n] = end;
    indent[n] = a - pos;
    cstart[n] = a;
    pos = next;
  }
  const lineNo = (n: number) => n + 1;
  const isMarker = (n: number) => indent[n] === 0 && text.startsWith('---', lstart[n]!) && endsBlank(lstart[n]! + 3, n);
  function endsBlank(from: number, n: number): boolean {
    const end = lend[n]!;
    if (from === end) return true;
    const c = text.charCodeAt(from);
    if (c !== SP && c !== TAB) return false;
    let i = from;
    while (i < end && (text.charCodeAt(i) === SP || text.charCodeAt(i) === TAB)) i++;
    return i === end || text.charCodeAt(i) === HASH;
  }

  let n = 0; // current line
  let docEnd = 0; // first line after the current document

  /** Next line inside the document with content; blank and comment lines are skipped. */
  function peek(): number {
    while (n < docEnd) {
      const c = cstart[n]!;
      if (c < lend[n]! && text.charCodeAt(c) !== HASH) {
        if (text.charCodeAt(c) === TAB) throw new Fail('tab-indent', lineNo(n), 'tab in indentation');
        return n;
      }
      n++;
    }
    return -1;
  }

  function node<T extends YamlNode>(v: T): T {
    if (++stats.nodes > MAX_YAML_NODES) {
      throw new Fail('too-many-nodes', v.line, `more than ${MAX_YAML_NODES} nodes; rest of the file not read`, true);
    }
    return v;
  }
  function depthOk(depth: number, line: number) {
    if (depth > MAX_YAML_DEPTH) throw new Fail('too-deep', line, `nesting deeper than ${MAX_YAML_DEPTH}`);
  }
  function scalar(value: string, style: YamlScalarStyle, line: number): YamlScalar {
    if (value.length > MAX_YAML_SCALAR) {
      throw new Fail('scalar-too-long', line, `scalar longer than ${MAX_YAML_SCALAR} characters`);
    }
    return node({ kind: 'scalar', value, style, line });
  }

  /** Rejects the indicators the subset leaves out, at the start of a node. */
  function refuse(c: number, line: number) {
    if (c === 38) throw new Fail('anchor', line, 'anchors (&) are not supported');
    if (c === 42) throw new Fail('alias', line, 'aliases (*) are not supported');
    if (c === 33) throw new Fail('tag', line, 'tags (!) are not supported');
    if (c === 63) throw new Fail('complex-key', line, 'complex keys (?) are not supported');
    if (c === 64 || c === 96) throw new Fail('syntax', line, 'reserved indicator');
  }

  /** Reads a quoted scalar starting at `i` (the quote) and ending before `end`; returns value and end. */
  function quoted(i: number, end: number, line: number): [string, number] {
    const q = text.charCodeAt(i);
    let s = '';
    let j = i + 1;
    for (;;) {
      stats.steps++;
      if (j >= end) throw new Fail('unterminated-quote', line, 'quoted scalar not closed on its line');
      const c = text.charCodeAt(j);
      if (c === q) {
        if (q === 39 && text.charCodeAt(j + 1) === 39 && j + 1 < end) {
          s += "'";
          j += 2;
          continue;
        }
        break;
      }
      if (q === 34 && c === 92) {
        const e = text[j + 1];
        if (e !== undefined && j + 1 < end && Object.hasOwn(ESCAPES, e)) {
          s += ESCAPES[e];
          j += 2;
        } else if ((e === 'x' || e === 'u' || e === 'U') && j + 1 < end) {
          const len = e === 'x' ? 2 : e === 'u' ? 4 : 8;
          const hex = text.slice(j + 2, j + 2 + len);
          const cp = /^[0-9a-fA-F]+$/.test(hex) && hex.length === len && j + 2 + len <= end ? parseInt(hex, 16) : -1;
          if (cp < 0 || cp > 0x10ffff) throw new Fail('bad-escape', line, `bad \\${e} escape`);
          s += String.fromCodePoint(cp);
          j += 2 + len;
        } else {
          throw new Fail('bad-escape', line, `unsupported escape \\${e ?? ''}`);
        }
      } else {
        s += text[j];
        j++;
      }
      if (s.length > MAX_YAML_SCALAR)
        throw new Fail('scalar-too-long', line, `scalar longer than ${MAX_YAML_SCALAR} characters`);
    }
    return [s, j + 1];
  }

  /** Position after blanks; an error unless only a comment or nothing follows. */
  function expectEnd(i: number, end: number, line: number) {
    while (i < end && (text.charCodeAt(i) === SP || text.charCodeAt(i) === TAB)) i++;
    if (i < end && text.charCodeAt(i) !== HASH) throw new Fail('syntax', line, 'unexpected text after value');
  }

  /** Plain scalar end in block context: before ` #` or the line end, trailing blanks trimmed. */
  function plainEnd(i: number, end: number): number {
    let j = i;
    while (j < end) {
      stats.steps++;
      const c = text.charCodeAt(j);
      if (c === HASH && j > i && (text.charCodeAt(j - 1) === SP || text.charCodeAt(j - 1) === TAB)) break;
      j++;
    }
    while (j > i && (text.charCodeAt(j - 1) === SP || text.charCodeAt(j - 1) === TAB)) j--;
    return j;
  }

  /** Finds `key:` at the start of a line's content; returns [key, position after ':'] or undefined. */
  function mapKey(i: number, end: number, line: number): [string, number] | undefined {
    const c = text.charCodeAt(i);
    if (c === 34 || c === 39) {
      const [k, j] = quoted(i, end, line);
      let p = j;
      while (p < end && text.charCodeAt(p) === SP) p++;
      if (
        text.charCodeAt(p) === 58 &&
        (p + 1 === end || text.charCodeAt(p + 1) === SP || text.charCodeAt(p + 1) === TAB)
      ) {
        return [k, p + 1];
      }
      return undefined;
    }
    if (c === 91 || c === 123 || c === HASH) return undefined;
    for (let j = i; j < end; j++) {
      stats.steps++;
      const d = text.charCodeAt(j);
      if (d === HASH && j > i && text.charCodeAt(j - 1) === SP) return undefined;
      if (d === 58 && (j + 1 === end || text.charCodeAt(j + 1) === SP || text.charCodeAt(j + 1) === TAB)) {
        let k = j;
        while (k > i && text.charCodeAt(k - 1) === SP) k--;
        const key = text.slice(i, k);
        if (key === '<<') throw new Fail('merge-key', line, 'merge keys (<<) are not supported');
        refuse(c, line);
        return [key, j + 1];
      }
    }
    return undefined;
  }

  const isSeqItem = (l: number) => {
    const c = cstart[l]!;
    return text.charCodeAt(c) === 45 && (c + 1 === lend[l] || text.charCodeAt(c + 1) === SP);
  };

  /** A node whose first line is `l` at its own indent (block map, block sequence, or a lone scalar/flow). */
  function blockNode(l: number, depth: number): YamlNode {
    depthOk(depth, lineNo(l));
    if (isSeqItem(l)) return blockSeq(indent[l]!, depth);
    const end = lend[l]!;
    if (mapKey(cstart[l]!, end, lineNo(l))) return blockMap(indent[l]!, depth);
    n = l + 1;
    return inlineValue(cstart[l]!, end, indent[l]! - 1, lineNo(l), depth, false);
  }

  function blockMap(col: number, depth: number): YamlMap {
    const l0 = peek();
    const map = node<YamlMap>({ kind: 'map', entries: [], line: lineNo(l0) });
    const seen = new Set<string>();
    for (let l = l0; l >= 0 && indent[l] === col; l = peek()) {
      const line = lineNo(l);
      if (isSeqItem(l)) throw new Fail('syntax', line, 'sequence item where a mapping key was expected');
      const k = mapKey(cstart[l]!, lend[l]!, line);
      if (!k) throw new Fail('syntax', line, 'expected `key: value`');
      if (seen.has(k[0]))
        diag('warning', 'duplicate-key', line, `duplicate key "${k[0]}"; the first is used, as ryml find_child does`);
      seen.add(k[0]);
      n = l + 1;
      map.entries.push({ key: k[0], line, value: inlineValue(k[1], lend[l]!, col, line, depth + 1, true) });
    }
    const l = peek();
    if (l >= 0 && indent[l]! > col) throw new Fail('syntax', lineNo(l), 'unexpected indentation');
    return map;
  }

  function blockSeq(col: number, depth: number): YamlSeq {
    const l0 = peek();
    const seq = node<YamlSeq>({ kind: 'seq', items: [], line: lineNo(l0) });
    for (let l = l0; l >= 0 && indent[l] === col && isSeqItem(l); l = peek()) {
      const line = lineNo(l);
      let a = cstart[l]! + 1;
      while (a < lend[l]! && text.charCodeAt(a) === SP) a++;
      if (a === lend[l] || text.charCodeAt(a) === HASH) {
        n = l + 1;
        seq.items.push(inlineValue(a, a, col, line, depth + 1, false));
        continue;
      }
      // compact form `- key: v` / `- - x`: the rest of the line is a node at its own column
      const sub = a - lstart[l]!;
      const nested = text.charCodeAt(a) === 45 && (a + 1 === lend[l] || text.charCodeAt(a + 1) === SP);
      if (nested || mapKey(a, lend[l]!, line)) {
        indent[l] = sub;
        cstart[l] = a;
        seq.items.push(blockNode(l, depth + 1));
        continue;
      }
      n = l + 1;
      seq.items.push(inlineValue(a, lend[l]!, col, line, depth + 1, false));
    }
    const l = peek();
    if (l >= 0 && indent[l]! > col) throw new Fail('syntax', lineNo(l), 'unexpected indentation');
    return seq;
  }

  /** The value after `key:` or `- ` from `i` to `end`; the parent sits at column `col`. */
  function inlineValue(i: number, end: number, col: number, line: number, depth: number, seqAtCol: boolean): YamlNode {
    depthOk(depth, line);
    while (i < end && (text.charCodeAt(i) === SP || text.charCodeAt(i) === TAB)) i++;
    if (i === end || text.charCodeAt(i) === HASH) {
      const l = peek();
      if (l >= 0 && indent[l]! > col) return blockNode(l, depth);
      if (l >= 0 && seqAtCol && indent[l] === col && isSeqItem(l)) return blockSeq(col, depth);
      return scalar('', 'plain', line);
    }
    const c = text.charCodeAt(i);
    refuse(c, line);
    let v: YamlNode;
    if (c === 124) return literal(i, end, col, line);
    if (c === 62) throw new Fail('folded-scalar', line, 'folded block scalars (>) are not supported');
    if (c === 91 || c === 123) {
      const [f, j] = flow(i, end, line, depth);
      expectEnd(j, end, line);
      v = f;
    } else if (c === 34 || c === 39) {
      const [s, j] = quoted(i, end, line);
      expectEnd(j, end, line);
      v = scalar(s, c === 34 ? 'double' : 'single', line);
    } else {
      const j = plainEnd(i, end);
      const s = text.slice(i, j);
      if (s.includes(': ')) throw new Fail('syntax', line, 'mapping values are not allowed in a plain scalar');
      v = scalar(s, 'plain', line);
    }
    const l = peek();
    if (l >= 0 && indent[l]! > col) {
      throw new Fail(
        v.kind === 'scalar' && v.style === 'plain' ? 'multi-line-scalar' : 'syntax',
        lineNo(l),
        'continuation lines are not supported',
      );
    }
    return v;
  }

  /** `|`, `|-`, `|+` block scalar; content lines are those indented past `col` (blank lines included). */
  function literal(i: number, end: number, col: number, line: number): YamlScalar {
    const chomp = text.charCodeAt(i + 1);
    let h = i + 1;
    if (chomp === 45 || chomp === 43) h++;
    if (h < end && text.charCodeAt(h) >= 48 && text.charCodeAt(h) <= 57) {
      throw new Fail('block-indicator', line, 'indentation indicators are not supported');
    }
    expectEnd(h, end, line);
    let ind = -1;
    const parts: string[] = [];
    let size = 0;
    for (; n < docEnd; n++) {
      if (n === count - 1 && lstart[n] === text.length && n > 0) break; // the empty pseudo-line after a final \n
      const blank = cstart[n] === lend[n];
      if (!blank && indent[n]! <= col) break;
      if (!blank && ind < 0) ind = indent[n]!;
      if (!blank && indent[n]! < ind) break;
      // a blank line keeps its spaces past the content indent: they are content
      const s = blank && !(ind >= 0 && indent[n]! > ind) ? '' : text.slice(lstart[n]! + ind, lend[n]);
      size += s.length + 1;
      stats.steps += s.length + 1;
      if (size > MAX_YAML_SCALAR)
        throw new Fail('scalar-too-long', line, `scalar longer than ${MAX_YAML_SCALAR} characters`);
      parts.push(s);
    }
    let body = parts.join('\n');
    if (chomp === 43) body += parts.length ? '\n' : '';
    else {
      let e = body.length; // a loop, not /\n+$/, which backtracks on every inner run of newlines
      while (e > 0 && body.charCodeAt(e - 1) === 10) e--;
      body = body.slice(0, e);
      if (chomp !== 45 && body !== '') body += '\n';
    }
    return scalar(body, 'literal', line);
  }

  /** A flow collection that must close on its line. */
  function flow(i: number, end: number, line: number, depth: number): [YamlNode, number] {
    depthOk(depth, line);
    const open = text.charCodeAt(i);
    const close = open === 91 ? 93 : 125;
    const coll: YamlSeq | YamlMap =
      open === 91 ? node<YamlSeq>({ kind: 'seq', items: [], line }) : node<YamlMap>({ kind: 'map', entries: [], line });
    let j = i + 1;
    const skip = () => {
      while (j < end && (text.charCodeAt(j) === SP || text.charCodeAt(j) === TAB)) {
        j++;
        stats.steps++;
      }
    };
    const item = (asKey: boolean): YamlNode => {
      skip();
      if (j >= end) throw new Fail('multi-line-flow', line, 'flow collection not closed on its line');
      const c = text.charCodeAt(j);
      refuse(c, line);
      if (c === 91 || c === 123) {
        const [f, k] = flow(j, end, line, depth + 1);
        j = k;
        return f;
      }
      if (c === 34 || c === 39) {
        const [s, k] = quoted(j, end, line);
        j = k;
        return scalar(s, c === 34 ? 'double' : 'single', line);
      }
      const a = j;
      while (j < end) {
        stats.steps++;
        const d = text.charCodeAt(j);
        if (d === 44 || d === 93 || d === 125) break;
        if (d === 58 && (j + 1 === end || text.charCodeAt(j + 1) === SP)) {
          if (asKey || open === 123) break;
          throw new Fail('syntax', line, 'single-pair mappings inside [] are not supported');
        }
        if (d === HASH && text.charCodeAt(j - 1) === SP)
          throw new Fail('multi-line-flow', line, 'flow collection not closed on its line');
        j++;
      }
      let b = j;
      while (b > a && text.charCodeAt(b - 1) === SP) b--;
      return scalar(text.slice(a, b), 'plain', line);
    };
    for (;;) {
      skip();
      if (j >= end) throw new Fail('multi-line-flow', line, 'flow collection not closed on its line');
      if (text.charCodeAt(j) === close) return [coll, j + 1];
      const first = item(coll.kind === 'map');
      skip();
      if (coll.kind === 'map') {
        if (first.kind !== 'scalar') throw new Fail('complex-key', line, 'collection used as a key');
        let value: YamlNode = scalar('', 'plain', line);
        if (text.charCodeAt(j) === 58) {
          j++;
          skip();
          const c = text.charCodeAt(j);
          if (c !== 44 && c !== close) value = item(false);
        }
        coll.entries.push({ key: first.value, line, value });
      } else coll.items.push(first);
      skip();
      const c = text.charCodeAt(j);
      if (c === 44) j++;
      else if (c !== close)
        throw new Fail(j >= end ? 'multi-line-flow' : 'syntax', line, 'expected , or a closing bracket');
    }
  }

  // Stream: split at `---` lines, parse each document, resume after a failed one.
  let first = 0;
  for (let l = 0; l <= count; l++) {
    if (l < count && !isMarker(l)) {
      const c = cstart[l]!;
      if (indent[l] === 0 && text.charCodeAt(c) === 37 && c < lend[l]!) {
        diag('error', 'directive', lineNo(l), 'directives (%) are not supported; line ignored');
        cstart[l] = lend[l]!;
      }
      if (indent[l] === 0 && text.startsWith('...', c) && endsBlank(c + 3, l)) {
        diag('error', 'document-end', lineNo(l), 'document end markers (...) are not supported; line ignored');
        cstart[l] = lend[l]!; // ignore the line
      }
      continue;
    }
    const start = first;
    const header = start > 0 ? start - 1 : -1; // the `---` line
    first = l + 1;
    n = start;
    docEnd = l;
    if (header >= 0) {
      // text after `---` on its own line is a document node the subset does not read
      let a = lstart[header]! + 3;
      while (a < lend[header]! && text.charCodeAt(a) === SP) a++;
      if (a < lend[header]! && text.charCodeAt(a) !== HASH) {
        diag('error', 'syntax', lineNo(header), 'content on the --- line is not supported; document dropped');
        documents.push({ line: lineNo(header), root: undefined });
        continue;
      }
    }
    try {
      const top = peek();
      if (top < 0) {
        if (header >= 0) documents.push({ line: lineNo(header), root: undefined });
        continue; // a missing implicit first document (file starts with ---) is not a document
      }
      const root = blockNode(top, 1);
      const rest = peek();
      if (rest >= 0) throw new Fail('syntax', lineNo(rest), 'unexpected text after the document root');
      documents.push({ line: header >= 0 ? lineNo(header) : 1, root });
    } catch (e) {
      if (!(e instanceof Fail)) throw e;
      diag('error', e.reason, e.line, e.fatal ? e.message : `${e.message}; document dropped`);
      documents.push({ line: header >= 0 ? lineNo(header) : 1, root: undefined });
      if (e.fatal) break;
    }
  }
  return out;
}
