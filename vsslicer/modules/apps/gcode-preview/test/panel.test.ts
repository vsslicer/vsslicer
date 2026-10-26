// SPDX-License-Identifier: AGPL-3.0-or-later
// The side panel: bounds on untrusted .gcode.3mf data (rule 25), the plate loader on the H2C fixture, the DOM as text, the highlight.
import test from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { ObjectLabel, Thumbnail } from '@vsslicer/gcode-api';
import {
  MAX_LABELS,
  MAX_PLATES,
  MAX_RANGES_PER_LABEL,
  MAX_TEXT,
  MAX_THUMBNAIL_BYTES,
  clip,
  panelOf,
  splitRange,
} from '../src/domain/panel.ts';
import { loadPlate } from '../src/application/load-3mf.ts';
import { dropUnusableThumbnails } from '../src/application/load-preview.ts';
import { workerLoader } from '../src/adapters/worker-loader.ts';
import { renderPanel, type PanelHandlers } from '../src/presentation/webview/side-panel.ts';

const fixture = (p: string) => fileURLToPath(new URL(`fixtures/${p}`, import.meta.url));
const png = (n: number) => {
  const b = new Uint8Array(n);
  b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return b;
};
const thumb = (data: Uint8Array, format: Thumbnail['format'] = 'png'): Thumbnail => ({
  format,
  width: 1,
  height: 1,
  data,
  fileOffset: 0,
});
const label = (name: string, ranges = [{ firstMove: 1, endMove: 5 }], copy?: number): ObjectLabel => ({
  name,
  copy,
  ranges,
});

test('clip: at most 256 characters, never half a surrogate pair', () => {
  assert.strictEqual(clip('a'.repeat(300)).length, MAX_TEXT);
  assert.strictEqual(clip('short'), 'short');
  const pair = 'a'.repeat(MAX_TEXT - 1) + '\u{1F600}'; // the pair straddles the limit
  assert.strictEqual(clip(pair), 'a'.repeat(MAX_TEXT - 1));
});

test('plates over the cap are cut to 256 with the total kept', () => {
  const numbers = Array.from({ length: MAX_PLATES + 500 }, (_, i) => i + 1);
  const m = panelOf({ thumbnails: [], objects: [] }, { plates: { numbers, plate: 1 } });
  assert.strictEqual(m.plates.length, MAX_PLATES);
  assert.strictEqual(m.plateCount, MAX_PLATES + 500);
});

test('labels over the cap are cut to 10,000; long names and range lists are clipped', () => {
  const objects = Array.from({ length: MAX_LABELS + 5 }, (_, i) => label(`o${i}`));
  const m = panelOf({ thumbnails: [], objects });
  assert.strictEqual(m.labels.length, MAX_LABELS);
  assert.strictEqual(m.labelCount, MAX_LABELS + 5);
  const many = Array.from({ length: MAX_RANGES_PER_LABEL + 10 }, (_, i) => ({ firstMove: i, endMove: i + 1 }));
  const big = panelOf({ thumbnails: [], objects: [label('x'.repeat(1000), many, 2)] }).labels[0]!;
  assert.strictEqual(big.text.length, MAX_TEXT);
  assert.strictEqual(big.ranges.length, MAX_RANGES_PER_LABEL);
  assert.strictEqual(panelOf({ thumbnails: [], objects: [label('a', [], 3)] }).labels[0]!.text, 'a #3');
});

test('a thumbnail is used only when it is a PNG of at most 4 MiB', () => {
  const m = panelOf({
    thumbnails: [
      thumb(png(100)),
      thumb(png(MAX_THUMBNAIL_BYTES)), // exactly at the limit
      thumb(png(MAX_THUMBNAIL_BYTES + 1)),
      thumb(png(100), 'jpg'),
      thumb(new Uint8Array(100)), // declared png, no PNG signature
    ],
    objects: [],
  });
  assert.deepStrictEqual(
    m.thumbnails.map((t) => t.data.byteLength),
    [100, MAX_THUMBNAIL_BYTES],
  );
  const plate = panelOf(
    { thumbnails: [], objects: [] },
    { plates: { numbers: [1], plate: 1, thumbnail: png(MAX_THUMBNAIL_BYTES + 1) } },
  );
  assert.deepStrictEqual(plate.thumbnails, [], 'the plate image obeys the same cap');
});

test('summary strings from plate statistics are clipped and non-finite numbers do not print as NaN', () => {
  const statistics = {
    index: 1,
    nozzleDiameters: [],
    objects: [],
    metadata: {},
    weightGrams: 3,
    filaments: [{ id: 1, type: 'P'.repeat(1000), color: '', usedMetres: NaN, usedGrams: 2 }],
  };
  const m = panelOf({ thumbnails: [], objects: [] }, { plates: { numbers: [1], plate: 1, statistics } });
  assert.ok(m.lines.every((l) => l.length <= MAX_TEXT));
  assert.ok(m.lines.every((l) => !l.includes('NaN')));
});

test('slicer estimates: the job summary and the plate prediction, finite and non-negative only', () => {
  const m = panelOf(
    { thumbnails: [], objects: [] },
    {
      job: { extruders: [], estimateSeconds: { normal: 100, silent: -1, total: Infinity } },
      plates: {
        numbers: [1],
        plate: 1,
        statistics: { index: 1, predictionSeconds: 60, nozzleDiameters: [], filaments: [], objects: [], metadata: {} },
      },
    },
  );
  assert.deepStrictEqual(m.slicerEstimates, [
    { label: 'normal', seconds: 100 },
    { label: 'plate', seconds: 60 },
  ]);
});

test('splitRange: hit and rest are clamped to the visible moves, merged and ascending', () => {
  assert.deepStrictEqual(
    splitRange({ first: 10, count: 20 }, [
      [25, 40],
      [0, 12],
      [20, 22],
      [21, 24],
      [50, 60],
    ]),
    {
      hit: [
        [10, 12],
        [20, 24],
        [25, 30],
      ],
      rest: [
        [12, 20],
        [24, 25],
      ],
    },
  );
  assert.deepStrictEqual(splitRange({ first: 0, count: 5 }, []), { hit: [], rest: [[0, 5]] });
});

test('the H2C fixture opens by plate: the first by default, plate 1 by number, an absent plate is refused', async () => {
  const archive = readFileSync(fixture('bambu-studio/h2c-cube.gcode.3mf'));
  const first = await loadPlate(archive, undefined);
  assert.deepStrictEqual([first.plates!.numbers, first.plates!.plate], [[1], 1]);
  assert.ok(first.parsed.moveCount > 100 && first.timing.totalTime > 0);
  assert.strictEqual(first.plates!.statistics?.index, 1);
  const m = panelOf(first.parsed, first);
  assert.strictEqual(m.thumbnails.length >= 1, true, 'plate_1.png is shown');
  assert.ok(
    m.slicerEstimates.some((e) => e.label === 'plate' && e.seconds > 0),
    'the slicer prediction sits next to ours',
  );
  assert.strictEqual((await loadPlate(archive, 1)).parsed.moveCount, first.parsed.moveCount);
  await assert.rejects(loadPlate(archive, 2), { code: 'no-such-plate' });
  await assert.rejects(loadPlate(new Uint8Array(0), undefined));
});

test('the worker opens the H2C fixture by plate', async () => {
  const entry = new URL('../src/adapters/worker-entry.ts', import.meta.url);
  const path = fixture('bambu-studio/h2c-cube.gcode.3mf');
  const ctl = new AbortController();
  const l = await workerLoader(entry)(path, 'gcode.3mf', ctl.signal, 1);
  assert.strictEqual(l.plates?.plate, 1);
  await assert.rejects(workerLoader(entry)(path, 'gcode.3mf', ctl.signal, 7), { code: 'no-such-plate' });
  const gcode = await workerLoader(entry)(fixture('orca/cube-marlin.gcode'), 'gcode', ctl.signal);
  assert.ok(gcode.job, 'a .gcode gets the slicer statistics');
});

// A DOM that records what is set and refuses markup.
class FakeEl {
  children: FakeEl[] = [];
  attrs: Record<string, string> = {};
  listeners: Record<string, (() => void)[]> = {};
  style: Record<string, string> = {};
  textContent = '';
  value = '';
  src = '';
  alt = '';
  tabIndex = -1;
  tag: string;
  constructor(tag: string) {
    this.tag = tag;
  }
  append(...kids: FakeEl[]) {
    this.children.push(...kids);
  }
  setAttribute(k: string, v: string) {
    this.attrs[k] = v;
  }
  addEventListener(type: string, f: () => void) {
    (this.listeners[type] ??= []).push(f);
  }
  fire(type: string) {
    this.listeners[type]?.forEach((f) => f());
  }
  all(): FakeEl[] {
    return [this, ...this.children.flatMap((c) => c.all())];
  }
  set innerHTML(_: string) {
    throw new Error('innerHTML is never used');
  }
  set outerHTML(_: string) {
    throw new Error('outerHTML is never used');
  }
  insertAdjacentHTML() {
    throw new Error('insertAdjacentHTML is never used');
  }
}
const doc = { createElement: (tag: string) => new FakeEl(tag) } as unknown as Pick<Document, 'createElement'>;
const handlers = (log: unknown[] = []): PanelHandlers => ({
  onHover: (i) => log.push(['hover', i]),
  onPlate: (p) => log.push(['plate', p]),
  imageUrl: (d) => (log.push(['url', d.byteLength]), `blob:${d.byteLength}`),
  releaseUrl: (u) => log.push(['release', u]),
});

test('hostile panel: a plate list over the cap and a markup label render clipped, as text', () => {
  const markup = `<img src=x onerror=alert(1)>${'z'.repeat(400)}`;
  const model = panelOf(
    { thumbnails: [thumb(png(50))], objects: [label(markup)] },
    { plates: { numbers: Array.from({ length: 1000 }, (_, i) => i + 1), plate: 3 } },
  );
  const log: unknown[] = [];
  const panel = renderPanel(doc, model, { seconds: 3725, planner: 'marlin' }, handlers(log));
  const els = (panel.element as unknown as FakeEl).all();

  assert.strictEqual(els.filter((e) => e.tag === 'option').length, MAX_PLATES);
  assert.ok(els.some((e) => e.textContent === `Showing ${MAX_PLATES} of 1000 plates`));
  const item = els.find((e) => e.tag === 'li' && e.textContent.startsWith('<img'))!;
  assert.strictEqual(item.textContent, markup.slice(0, MAX_TEXT), 'the markup is text, clipped');
  assert.strictEqual(item.children.length, 0, 'it did not become elements');
  assert.ok(els.every((e) => !e.tag.includes('script')));
  assert.strictEqual(els.filter((e) => e.tag === 'img').length, 1, 'only the vetted thumbnail is an image');
  assert.ok(els.some((e) => e.textContent === 'Our estimate: 1h 2m 5s (marlin)'));
  assert.ok(els.some((e) => e.textContent === 'Slicer estimate: not stated in the file'));

  panel.dispose();
  assert.deepStrictEqual(log.at(-1), ['release', 'blob:50']);
});

test('labels highlight on hover and focus and clear on leave; the picker reports the plate', () => {
  const log: unknown[] = [];
  const model = panelOf(
    { thumbnails: [], objects: [label('a'), label('b')] },
    { plates: { numbers: [1, 2], plate: 2 } },
  );
  const els = (renderPanel(doc, model, { seconds: 1, planner: 'm' }, handlers(log)).element as unknown as FakeEl).all();
  const [a, b] = els.filter((e) => e.tag === 'li' && ['a', 'b'].includes(e.textContent));
  a!.fire('mouseenter');
  b!.fire('focus');
  b!.fire('blur');
  a!.fire('mouseleave');
  assert.deepStrictEqual(log, [
    ['hover', 0],
    ['hover', 1],
    ['hover', undefined],
    ['hover', undefined],
  ]);
  const select = els.find((e) => e.tag === 'select')!;
  assert.strictEqual(select.value, '2');
  select.value = '1';
  select.fire('change');
  assert.deepStrictEqual(log.at(-1), ['plate', 1]);
});

test('no oversize or non-PNG thumbnail leaves the worker', () => {
  const l = {
    parsed: { thumbnails: [thumb(png(10)), thumb(png(MAX_THUMBNAIL_BYTES + 1)), thumb(png(10), 'jpg')] },
    plates: { numbers: [1], plate: 1, thumbnail: png(MAX_THUMBNAIL_BYTES + 1) },
  } as unknown as Parameters<typeof dropUnusableThumbnails>[0];
  dropUnusableThumbnails(l);
  assert.deepStrictEqual(
    l.parsed.thumbnails.map((t) => t.data.byteLength),
    [10],
  );
  assert.strictEqual(l.plates!.thumbnail, undefined);
});
