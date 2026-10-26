// SPDX-License-Identifier: AGPL-3.0-or-later
import type { BuildEntry } from './zipBuilder.ts';

export const coreNs = 'http://schemas.microsoft.com/3dmanufacturing/core/2015/02';
export const startPartType = 'http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel';

export const contentTypes = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
 <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
 <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>
</Types>`;

export const rootRels = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
 <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="${startPartType}"/>
</Relationships>`;

export const triangleModel = `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US" xmlns="${coreNs}">
 <resources>
  <object id="1" type="model"><mesh>
   <vertices><vertex x="0" y="0" z="0"/><vertex x="10" y="0" z="0"/><vertex x="0" y="10" z="0"/></vertices>
   <triangles><triangle v1="0" v2="1" v3="2"/></triangles>
  </mesh></object>
 </resources>
 <build><item objectid="1"/></build>
</model>`;

/** A valid one-triangle package; override any part by name, or drop it with `null`. */
export function minimalEntries(overrides: Record<string, string | null> = {}): BuildEntry[] {
  const parts: Record<string, string | null> = {
    '[Content_Types].xml': contentTypes,
    '_rels/.rels': rootRels,
    '3D/3dmodel.model': triangleModel,
    ...overrides,
  };
  return Object.entries(parts).flatMap(([name, data]) => (data === null ? [] : [{ name, data }]));
}
