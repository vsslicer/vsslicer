// SPDX-License-Identifier: AGPL-3.0-only
// The generated catalogue data (AGPL-3.0-only, see PROVENANCE.md), checked against CATALOGUE_LIMITS on load.
// Typed loosely on purpose: the catalogue types live in @vsslicer/profile-api, which casts these values.
import { checkCatalogueJson } from './load.ts';
import orca from './data/orca.json' with { type: 'json' };
import bambu from './data/bambu.json' with { type: 'json' };
import prusa from './data/prusa.json' with { type: 'json' };
import superslicer from './data/superslicer.json' with { type: 'json' };
import cura from './data/cura.json' with { type: 'json' };
import groups from './data/groups.json' with { type: 'json' };

export { CATALOGUE_LIMITS, CatalogueDataError, checkCatalogueJson, parseCatalogueJson } from './load.ts';
export type { CatalogueJson, CatalogueLimits } from './load.ts';

export const orcaCatalogue = checkCatalogueJson(orca);
export const bambuCatalogue = checkCatalogueJson(bambu);
export const prusaCatalogue = checkCatalogueJson(prusa);
export const superslicerCatalogue = checkCatalogueJson(superslicer);
export const curaCatalogue = checkCatalogueJson(cura);
/** The generator's group-count report. */
export const catalogueGroups = checkCatalogueJson(groups);
