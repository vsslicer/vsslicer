// SPDX-License-Identifier: AGPL-3.0-or-later
// Prints triangle count and bounding box of every STL/OBJ fixture as three.js loads it (the recorded oracle).
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Box3 } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'test', 'fixtures', 'stl-obj');
for (const name of readdirSync(dir).sort()) {
  const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
  if (ext !== '.stl' && ext !== '.obj') continue;
  const data = readFileSync(dir + '/' + name);
  try {
    let tri = 0;
    const box = new Box3();
    if (ext === '.stl') {
      const g = new STLLoader().parse(data.buffer.slice(data.byteOffset, data.byteOffset + data.length));
      tri = g.getAttribute('position').count / 3;
      g.computeBoundingBox();
      box.copy(g.boundingBox);
    } else {
      const o = new OBJLoader().parse(data.toString('latin1'));
      box.setFromObject(o);
      o.traverse((m) => {
        if (m.isMesh) tri += m.geometry.getAttribute('position').count / 3;
      });
    }
    console.log(name, tri, box.min.toArray().join(','), box.max.toArray().join(','));
  } catch (e) {
    console.log(name, 'ERROR', e.message);
  }
}
