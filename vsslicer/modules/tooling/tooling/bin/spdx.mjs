// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX licence expression evaluation against the allow-list of licences that may be bundled into an
// AGPL-3.0-or-later extension (D2). Grammar: expr = and (OR and)*, and = with (AND with)*,
// with = (id[+] | "(" expr ")") [WITH exception]. Operators are case-insensitive, as in the SPDX spec.
//
// Sources for the list: ASF https://www.apache.org/licenses/GPL-compatibility.html (Apache-2.0 may be
// included in GPLv3 works, not GPL-2.0-only) and the FSF licence list
// https://www.gnu.org/licenses/license-list.html (Expat/MIT, ISC, FreeBSD/Modified BSD, zlib, CC0,
// Unlicense, 0BSD, LGPLv3, GPLv3, AGPLv3 are GPL-compatible); MPL-2.0 s3.3 names GPL/LGPL/AGPL as
// secondary licences; LGPL-2.1 s3 lets a user switch to GPL-2.0-or-later. GPL-2.0-only is excluded.
const allowed = [
  'AGPL-3.0',
  'AGPL-3.0-only',
  'AGPL-3.0-or-later',
  'GPL-3.0',
  'GPL-3.0-only',
  'GPL-3.0-or-later',
  'GPL-2.0-or-later',
  'LGPL-2.1',
  'LGPL-2.1-only',
  'LGPL-2.1-or-later',
  'LGPL-3.0',
  'LGPL-3.0-only',
  'LGPL-3.0-or-later',
  'MIT',
  'MIT-0',
  'ISC',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'Apache-2.0',
  '0BSD',
  'Zlib',
  'CC0-1.0',
  'Unlicense',
  'BlueOak-1.0.0',
  'MPL-2.0',
];
export const allowList = allowed;
const ok = new Set(allowed.map((s) => s.toLowerCase()));
// "X+" means X or any later version, so GPL-2.0+ can be taken as GPL-3.0
const orLater = new Set(['gpl-2.0', 'gpl-2.0-only', 'lgpl-2.0', 'lgpl-2.1-only']);

const id = (s) => {
  const l = s.toLowerCase();
  return ok.has(l) || (l.endsWith('+') && (ok.has(l.slice(0, -1)) || orLater.has(l.slice(0, -1))));
};

/** @returns {boolean} whether the expression can be satisfied using only allow-listed licences; throws on bad syntax */
export const isAllowed = (expression) => {
  const tokens = expression.match(/[()]|[^\s()]+/g) ?? [];
  let i = 0;
  const kw = (w) => tokens[i]?.toUpperCase() === w;
  const expr = () => {
    let r = and();
    while (kw('OR')) {
      i++;
      r = and() || r; // always parse both sides
    }
    return r;
  };
  const and = () => {
    let r = withEx();
    while (kw('AND')) {
      i++;
      r = withEx() && r;
    }
    return r;
  };
  const withEx = () => {
    let r;
    if (tokens[i] === '(') {
      i++;
      r = expr();
      if (tokens[i++] !== ')') throw new Error(`missing ")" in "${expression}"`);
    } else {
      const t = tokens[i++];
      if (t === undefined || t === ')' || ['AND', 'OR', 'WITH'].includes(t.toUpperCase()))
        throw new Error(`unexpected "${t ?? 'end'}" in "${expression}"`);
      r = id(t);
    }
    // an exception only adds permissions, so the base licence decides
    if (kw('WITH')) {
      i++;
      if (tokens[i] === undefined) throw new Error(`missing exception in "${expression}"`);
      i++;
    }
    return r;
  };
  const r = expr();
  if (i < tokens.length) throw new Error(`unexpected "${tokens[i]}" in "${expression}"`);
  return r;
};
