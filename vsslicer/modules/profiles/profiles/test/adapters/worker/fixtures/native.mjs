// SPDX-License-Identifier: AGPL-3.0-or-later
// A result whose native map has keys that collide with Object.prototype.
export default {
  formats: [],
  canHandle: () => true,
  import: async () => {
    const native = Object.create(null);
    native['constructor'] = { a: 1 };
    native['__proto__'] = { b: 2 };
    return { entities: [], native, diagnostics: [] };
  },
};
