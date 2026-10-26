// SPDX-License-Identifier: AGPL-3.0-or-later
// The published profile schemas name each other by absolute https://vsslicer.dev URLs, which VS Code's JSON service
// refuses to fetch (untrusted, and the host does not serve them). The shipped copy differs only by that prefix
// becoming `./`, so `$ref`s resolve to the sibling file; test/schemas.test.ts proves it is the only difference.
export const SCHEMA_BASE = 'https://vsslicer.dev/schema/profile/';

export const fileName = (s: { $id?: unknown }): string => String(s.$id).slice(SCHEMA_BASE.length);

export const toFile = (s: object): string => `${JSON.stringify(s, null, 2).replaceAll(SCHEMA_BASE, './')}\n`;
