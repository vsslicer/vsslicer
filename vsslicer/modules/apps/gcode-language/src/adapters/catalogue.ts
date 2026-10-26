// SPDX-License-Identifier: AGPL-3.0-or-later
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseEntries, type CatalogueEntry } from '../domain/catalogue.ts';

/** Loads and validates every `*.json` file in a catalogue directory (one per flavour family, so lanes never share a file). */
export const loadCatalogue = (dir: string): CatalogueEntry[] =>
  readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .flatMap((f) => parseEntries(JSON.parse(readFileSync(join(dir, f), 'utf8')), f));
