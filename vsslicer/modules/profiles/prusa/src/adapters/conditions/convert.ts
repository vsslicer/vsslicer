// SPDX-License-Identifier: AGPL-3.0-or-later
import { MAPPED_KEYS, nativeKeys, parseCondition } from '@vsslicer/profile-api';
import { notesRegexToTags } from './tags.ts';

/** Same bound as the unified parser: longer input is rejected before any scanning. */
export const MAX_CONDITION_LENGTH = 64 * 1024;
/** Bound on tokens we will translate. */
export const MAX_CONDITION_TOKENS = 8192;

export interface ConvertedCondition {
  /** Unified condition, or null when the input could not be converted (see diagnostics). */
  expression: string | null;
  /** True when the unified form is weaker or looser than the Prusa original. */
  lossy: boolean;
  diagnostics: string[];
}

interface Tok {
  k: 'name' | 'num' | 'str' | 'regex' | 'op';
  text: string;
  index?: number;
}

const PUNCT = ['&&', '||', '==', '!=', '<=', '>=', '=~', '!~', '<', '>', '!', '(', ')'];
const NAME = /[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*/y;
const NUM = /-?(?:\d+\.?\d*|\.\d+)/y;
const INDEX = /\[\s*(\d{1,3})\s*\]/y;
const sticky = (re: RegExp, s: string, i: number) => {
  re.lastIndex = i;
  return re.exec(s);
};

function lex(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i]!;
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (out.length > MAX_CONDITION_TOKENS) throw new Error('too many tokens');
    const prev = out.at(-1);
    if (c === '/' && prev?.k === 'op' && (prev.text === '=~' || prev.text === '!~')) {
      let j = i + 1;
      while (j < src.length && src[j] !== '/') j += src[j] === '\\' ? 2 : 1;
      if (j >= src.length) throw new Error('unterminated regular expression');
      out.push({ k: 'regex', text: src.slice(i + 1, j) });
      i = j + 1;
      continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== c) j += src[j] === '\\' ? 2 : 1;
      if (j >= src.length) throw new Error('unterminated string');
      out.push({ k: 'str', text: src.slice(i + 1, j) });
      i = j + 1;
      continue;
    }
    const num = sticky(NUM, src, i);
    if (num) {
      out.push({ k: 'num', text: num[0] });
      i += num[0].length;
      continue;
    }
    const name = sticky(NAME, src, i);
    if (name) {
      i += name[0].length;
      const idx = sticky(INDEX, src, i);
      if (idx) i += idx[0].length;
      out.push({ k: 'name', text: name[0], ...(idx ? { index: Number(idx[1]) } : {}) });
      continue;
    }
    const p = PUNCT.find((x) => src.startsWith(x, i));
    if (!p) throw new Error(`unexpected character '${c}' at ${i}`);
    out.push({ k: 'op', text: p });
    i += p.length;
  }
  return out;
}

const KEYWORDS = new Set(['and', 'or', 'not', 'true', 'false']);
let reverse: Map<string, string[]> | undefined;
/** Prusa native key -> the unified keys that span it (built once from profile-api's catalogue). */
function unifiedKeysOf(native: string): string[] {
  if (!reverse) {
    reverse = new Map();
    for (const key of MAPPED_KEYS) {
      let natives: string[];
      try {
        natives = nativeKeys('prusa', key);
      } catch {
        continue; // the key has no Prusa equivalent
      }
      for (const n of natives) reverse.set(n, [...(reverse.get(n) ?? []), key]);
    }
  }
  return reverse.get(native) ?? [];
}
const SIMPLE_NAMES: Record<string, string> = {
  printer_model: 'printer.model',
  base_model: 'printer.family',
  'printer.base_model': 'printer.family',
  single_extruder_multi_material: 'printer.features.single_extruder_multi_material',
  num_extruders: 'printer.toolheads.count',
};
const NAMESPACES = new Set(['printer', 'nozzle', 'surface', 'feeder', 'material', 'process']);

/**
 * Converts a PrusaSlicer compatibility condition (2.x, or 3.0 with `tool.*`/`feeder.*`/`base_model`) into
 * the unified condition language (docs/research/profiles.md section 6). One linear pass over bounded input;
 * the result is re-parsed with the profile-api parser and rejected if it does not parse.
 */
export function convertPrusaCondition(src: string): ConvertedCondition {
  const diagnostics: string[] = [];
  let lossy = false;
  const fail = (msg: string): ConvertedCondition => ({
    expression: null,
    lossy: true,
    diagnostics: [...diagnostics, msg],
  });
  if (src.length > MAX_CONDITION_LENGTH) return fail(`condition longer than ${MAX_CONDITION_LENGTH} characters`);
  let toks: Tok[];
  try {
    toks = lex(src);
  } catch (e) {
    return fail((e as Error).message);
  }
  const note = (msg: string) => {
    lossy = true;
    diagnostics.push(msg);
  };
  const out: string[] = [];
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i]!;
    if (t.k === 'name' && t.index !== undefined && !/^(tool\.)?nozzle_(diameter|high_flow)$/.test(t.text))
      note(`index [${t.index}] on '${t.text}' is dropped`);
    if (t.k === 'op') {
      out.push(t.text === '&&' ? 'and' : t.text === '||' ? 'or' : t.text === '!' ? 'not' : t.text);
    } else if (t.k === 'num') out.push(t.text);
    else if (t.k === 'str') {
      const text = t.text.replace(/\\(.)/g, (_, c: string) => {
        if (!/["'\\]/.test(c)) note(`escape \\${c} in a string literal is not carried over`);
        return c;
      });
      out.push(`'${text.replace(/[\\']/g, '\\$&')}'`);
    } else if (t.k === 'regex') out.push(`/${t.text}/`);
    else if (KEYWORDS.has(t.text)) out.push(t.text);
    else if (t.text === 'printer_notes') {
      const op = toks[i + 1];
      const re = toks[i + 2];
      if (op?.k === 'op' && (op.text === '=~' || op.text === '!~') && re?.k === 'regex') {
        const r = notesRegexToTags(re.text);
        if (r.unknown) note(`unknown printer_notes keyword in /${re.text}/`);
        else if (r.lossy) lossy = true;
        if (r.diagnostic) diagnostics.push(r.diagnostic);
        const wrapped = r.expression.startsWith('(') ? r.expression : `(${r.expression})`;
        out.push(op.text === '!~' ? `not ${wrapped}` : wrapped);
        i += 2;
      } else {
        note('printer_notes used outside =~ or !~');
        out.push('printer.notes');
      }
    } else if (t.text === 'nozzle_diameter' || t.text === 'tool.nozzle_diameter') {
      if (t.index !== undefined && t.index !== 0)
        note(`nozzle_diameter[${t.index}] folded to the extruder in question`);
      out.push('nozzle.diameter');
    } else if (t.text === 'nozzle_high_flow' || t.text === 'tool.nozzle_high_flow') {
      if (t.index !== undefined && t.index !== 0)
        note(`nozzle_high_flow[${t.index}] folded to the extruder in question`);
      out.push("(nozzle.flow == 'high_flow')");
    } else if (SIMPLE_NAMES[t.text]) out.push(SIMPLE_NAMES[t.text]!);
    else if (t.text.startsWith('tool.')) out.push(`nozzle.${t.text.slice(5)}`);
    else if (NAMESPACES.has(t.text.split('.')[0]!) && t.text.includes('.')) out.push(t.text);
    else {
      const keys = unifiedKeysOf(t.text);
      if (keys.length === 1) out.push(`printer.settings.${keys[0]}`);
      else {
        note(`${keys.length ? 'ambiguous' : 'unmapped'} identifier '${t.text}'`);
        out.push(`printer.settings.${keys[0] ?? t.text}`);
      }
    }
  }
  const expression = out.join(' ');
  try {
    parseCondition(expression);
  } catch (e) {
    return fail(`converted condition does not parse: ${(e as Error).message}`);
  }
  return { expression, lossy, diagnostics };
}
