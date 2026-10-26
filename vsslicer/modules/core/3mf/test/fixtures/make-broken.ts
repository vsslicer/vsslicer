// SPDX-License-Identifier: AGPL-3.0-or-later
// Regenerates test/fixtures/broken/*.3mf. Deterministic: run `node test/fixtures/make-broken.ts` from the module.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { coreNs, minimalEntries, triangleModel } from '../support/minimalPackage.ts';
import { buildZip } from '../support/zipBuilder.ts';

const out = join(dirname(fileURLToPath(import.meta.url)), 'broken');
mkdirSync(out, { recursive: true });
const write = (name: string, bytes: Uint8Array): void => writeFileSync(join(out, name), bytes);

const valid = buildZip(minimalEntries());
// Cut inside the central directory: no end record, so no archive can be found.
write('corrupt-zip.3mf', valid.subarray(0, valid.length - 40));
// The start-part relationship points at a model that is not in the zip.
write('missing-root-model.3mf', buildZip(minimalEntries({ '3D/3dmodel.model': null })));
write('malformed-xml.3mf', buildZip(minimalEntries({ '3D/3dmodel.model': triangleModel.replace('</mesh>', '') })));
write(
  'unsupported-required-extension.3mf',
  buildZip(
    minimalEntries({
      '3D/3dmodel.model': triangleModel.replace(
        `<model unit`,
        `<model requiredextensions="z" xmlns:z="http://example.com/3mf/unknown/2099" unit`,
      ),
    }),
  ),
);
// Central directory declares 4 GiB for the model although 600 bytes are stored.
const bomb = minimalEntries();
write(
  'zip-bomb.3mf',
  buildZip(bomb.map((e) => (e.name === '3D/3dmodel.model' ? { ...e, declaredSize: 4 * 1024 ** 3 - 1 } : e))),
);
write(
  'missing-production-part.3mf',
  buildZip(
    minimalEntries({
      '3D/3dmodel.model': `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" requiredextensions="p" xmlns="${coreNs}" xmlns:p="http://schemas.microsoft.com/3dmanufacturing/production/2015/06">
 <resources>
  <object id="1" type="model"><components><component objectid="1" p:path="/3D/Objects/missing.model" p:UUID="00000000-0000-0000-0000-000000000001"/></components></object>
 </resources>
 <build><item objectid="1"/></build>
</model>`,
    }),
  ),
);
