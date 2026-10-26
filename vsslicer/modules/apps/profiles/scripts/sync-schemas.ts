// SPDX-License-Identifier: AGPL-3.0-or-later
// Writes the published profile JSON Schemas (@vsslicer/profile-api) to schemas/. Run after bumping the profile-api
// range: `pnpm sync-schemas`. test/schemas.test.ts fails while the copies are stale.
import { mkdirSync, writeFileSync } from 'node:fs';
// eslint-disable-next-line import-x/no-extraneous-dependencies -- build-time tool; the schemas ship as files, nothing is imported at runtime
import { allSchemas } from '@vsslicer/profile-api';
import { fileName, toFile } from './schema-files.ts';

mkdirSync(new URL('../schemas/', import.meta.url), { recursive: true });
for (const s of allSchemas) writeFileSync(new URL(`../schemas/${fileName(s)}`, import.meta.url), toFile(s));
