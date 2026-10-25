// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Thumbnail, ThumbnailFormat } from '@vsslicer/gcode-api';
import type { ChunkWriter } from './chunk-writer.ts';

const SEMICOLON = 0x3b;
const SPACE = 0x20;
const TAB = 0x09;
/** A thumbnail block or Cura settings text longer than this (characters) is dropped; a missing `end` must not swallow the file. */
const MAX_TEXT = 16 << 20;

const decoder = new TextDecoder('utf-8');
const isBlank = (c: number | undefined): boolean => c === SPACE || c === TAB;
const text = (buf: Uint8Array, from: number, to: number): string => decoder.decode(buf.subarray(from, to));

/** Does `buf[i..end)` start with `word`, ignoring case (ASCII)? */
function startsWith(buf: Uint8Array, i: number, end: number, word: string): boolean {
  if (i + word.length > end) return false;
  for (let k = 0; k < word.length; k++) {
    const c = buf[i + k] ?? 0;
    if ((c >= 0x41 && c <= 0x5a ? c | 0x20 : c) !== word.charCodeAt(k)) return false;
  }
  return true;
}

const FORMATS: Record<string, { format: ThumbnailFormat; magic: number[] } | undefined> = {
  '': { format: 'png', magic: [0x89, 0x50, 0x4e, 0x47] },
  PNG: { format: 'png', magic: [0x89, 0x50, 0x4e, 0x47] },
  JPG: { format: 'jpg', magic: [0xff, 0xd8, 0xff] },
  JPEG: { format: 'jpg', magic: [0xff, 0xd8, 0xff] },
  QOI: { format: 'qoi', magic: [0x71, 0x6f, 0x69, 0x66] },
};

const THUMBNAIL = /^thumbnail(?:_([A-Za-z0-9]+))? (begin|end)(?: (\d+)x(\d+))?(?: (\d+))?/;
const CONFIG_BEGIN = /^\w+_config = begin\s*$/;
const CONFIG_END = /^\w+_config = end\s*$/;
const SETTING = /^SETTING_\d+ /;

/** What is being printed since the last label: M486 keeps the index until the name is known. */
interface Span {
  name?: string;
  id?: string;
  copy?: number;
  m486?: number;
  first: number;
}

interface ThumbBlock {
  tag: string;
  width: number;
  height: number;
  length: number | undefined;
  fileOffset: number;
  /** Unsupported format: lines are skipped, nothing collected. */
  skip: boolean;
  parts: string[];
  chars: number;
}

/**
 * Reads the comment blocks and labels that are not moves, in the same pass: thumbnails
 * (`; thumbnail begin WxH len` ... `; thumbnail end`, `_JPG` / `_QOI` variants), the config block
 * (`; <slicer>_config = begin` ... `end`, `; CONFIG_BLOCK_START` ... `_END`, Cura `;SETTING_3`
 * lines) and the object labels (`; printing object` / `; stop printing object`, `M486 S/A`,
 * `EXCLUDE_OBJECT_DEFINE/START/END`, Cura `;MESH:`). Labels are moves ranges; the one open range
 * closes at the next label, a stop line or the end of the file. The lines also reach the other
 * handlers: `M486` and `EXCLUDE_OBJECT_*` stay markers, comments are the slicer-tag reader's.
 */
export class Metadata {
  private readonly out: ChunkWriter;
  private thumb: ThumbBlock | null = null;
  private span: Span | null = null;
  /** M486 object index to name (`M486 A`). */
  private readonly names = new Map<number, string>();
  private m486Current = -1;
  /** Config block entries being read; null outside a block. */
  private config: [string, string][] | null = null;
  private curaText = '';
  private curaOffset = 0;

  constructor(out: ChunkWriter) {
    this.out = out;
  }

  /** `buf[0, end)` is one line without its line break. */
  handle(buf: Uint8Array, end: number, fileOffset: number): void {
    let i = 0;
    while (i < end && isBlank(buf[i])) i++;
    if (buf[i] === SEMICOLON) return this.comment(buf, i + 1, end, fileOffset);
    if (i >= end) return;
    // a command inside a block ends it: the block was not closed
    if (this.thumb) this.dropThumb('thumbnail-unterminated', 'thumbnail block has no end line', fileOffset);
    if (this.config) this.endConfig();
    const c = (buf[i] ?? 0) | 0x20;
    if (c === 0x6d && startsWith(buf, i, end, 'm486') && (end === i + 4 || isBlank(buf[i + 4]))) {
      this.m486(text(buf, i + 4, end));
    } else if (c === 0x65 && startsWith(buf, i, end, 'exclude_object_')) {
      this.klipper(text(buf, i + 15, end));
    }
  }

  /** At the end of the file: closes the open range and reports what was left open. */
  finish(fileOffset: number): void {
    if (this.thumb) this.dropThumb('thumbnail-unterminated', 'thumbnail block has no end line', fileOffset);
    if (this.config) this.endConfig();
    if (this.curaText) this.cura();
    this.closeSpan();
  }

  private comment(buf: Uint8Array, from: number, end: number, fileOffset: number): void {
    let i = from;
    while (i < end && isBlank(buf[i])) i++;
    if (this.thumb) return this.thumbLine(buf, i, end, fileOffset);
    if (this.config) return this.configLine(buf, i, end);
    const c = buf[i];
    switch (c) {
      case 0x74: // t
        if (startsWith(buf, i, end, 'thumbnail')) this.thumbHeader(text(buf, i, end), fileOffset);
        return;
      case 0x70: // p
        if (startsWith(buf, i, end, 'printing object ')) this.open(text(buf, i + 16, end).trim());
        break;
      case 0x73: // s
        if (startsWith(buf, i, end, 'stop printing object')) this.closeSpan();
        break;
      case 0x4d: // M
        if (startsWith(buf, i, end, 'mesh:')) this.mesh(text(buf, i + 5, end).trim());
        break;
      case 0x53: // S
        if (SETTING.test(text(buf, i, Math.min(end, i + 20)))) this.curaLine(buf, i, end, fileOffset);
        break;
      case 0x43: // C
        if (text(buf, i, end).trim() === 'CONFIG_BLOCK_START') this.config = [];
        break;
    }
    if (c !== 0x43 && buf[end - 1] === 0x6e && CONFIG_BEGIN.test(text(buf, i, end))) this.config = [];
  }

  // thumbnails

  private thumbHeader(line: string, fileOffset: number): void {
    const m = THUMBNAIL.exec(line);
    if (m?.[2] !== 'begin') return;
    const tag = (m[1] ?? '').toUpperCase();
    const known = FORMATS[tag] !== undefined;
    if (m[3] === undefined && known) {
      this.out.diagnostic('thumbnail-header', 'warning', fileOffset, 'thumbnail begin line has no WxH size; skipped');
    }
    if (!known) {
      this.out.marker(`THUMBNAIL_${tag}`, fileOffset);
      this.out.diagnostic(
        'thumbnail-format',
        'warning',
        fileOffset,
        `thumbnail format "${tag}" is not supported (png, jpg, qoi); skipped`,
      );
    }
    this.thumb = {
      tag,
      width: Number(m[3]),
      height: Number(m[4]),
      length: m[5] === undefined ? undefined : Number(m[5]),
      fileOffset,
      skip: !known || m[3] === undefined,
      parts: [],
      chars: 0,
    };
  }

  private thumbLine(buf: Uint8Array, i: number, end: number, fileOffset: number): void {
    const t = this.thumb;
    if (!t) return;
    if (startsWith(buf, i, end, 'thumbnail')) {
      const m = THUMBNAIL.exec(text(buf, i, end));
      if (m?.[2] === 'end') return this.endThumb(t);
      if (m?.[2] === 'begin') {
        this.dropThumb('thumbnail-unterminated', 'thumbnail block has no end line', fileOffset);
        return this.thumbHeader(text(buf, i, end), fileOffset);
      }
    }
    if (t.skip) return;
    t.chars += end - i;
    if (t.chars > MAX_TEXT) {
      this.dropThumb('thumbnail-too-long', 'thumbnail block longer than 16 MiB; skipped', t.fileOffset);
      return;
    }
    t.parts.push(text(buf, i, end).trim());
  }

  private endThumb(t: ThumbBlock): void {
    this.thumb = null;
    if (t.skip) return;
    const spec = FORMATS[t.tag];
    const base64 = t.parts.join('');
    let data: Uint8Array;
    try {
      const bin = atob(base64);
      data = new Uint8Array(bin.length);
      for (let k = 0; k < bin.length; k++) data[k] = bin.charCodeAt(k);
    } catch {
      return this.out.diagnostic(
        'thumbnail-invalid',
        'warning',
        t.fileOffset,
        'thumbnail is not valid base64; skipped',
      );
    }
    if (!spec || !spec.magic.every((b, k) => data[k] === b)) {
      return this.out.diagnostic(
        'thumbnail-invalid',
        'warning',
        t.fileOffset,
        `thumbnail data is not a ${t.tag || 'PNG'} file (wrong magic bytes); skipped`,
      );
    }
    // the length the slicer states is the base64 text (PrusaSlicer, Orca); some write the byte size
    if (t.length !== undefined && t.length !== base64.length && t.length !== data.length) {
      return this.out.diagnostic(
        'thumbnail-length',
        'warning',
        t.fileOffset,
        `thumbnail states ${t.length} but has ${base64.length} base64 characters (${data.length} bytes); skipped`,
      );
    }
    const thumbnail: Thumbnail = {
      format: spec.format,
      width: t.width,
      height: t.height,
      data,
      fileOffset: t.fileOffset,
    };
    this.out.thumbnail(thumbnail);
  }

  private dropThumb(code: string, message: string, fileOffset: number): void {
    const t = this.thumb;
    this.thumb = null;
    if (t && !t.skip) this.out.diagnostic(code, 'warning', fileOffset, message);
  }

  // config

  private configLine(buf: Uint8Array, i: number, end: number): void {
    const line = text(buf, i, end);
    if (line.trim() === 'CONFIG_BLOCK_END' || CONFIG_END.test(line)) return this.endConfig();
    const eq = line.indexOf(' = ');
    if (eq > 0) this.config?.push([line.slice(0, eq), line.slice(eq + 3)]);
    else if (line.endsWith(' =')) this.config?.push([line.slice(0, -2), '']);
  }

  private endConfig(): void {
    if (this.config) this.out.config(this.config);
    this.config = null;
  }

  // Cura: the settings are one JSON text cut into `;SETTING_<v> ` lines, with \\, \n and \r escaped again

  private curaLine(buf: Uint8Array, i: number, end: number, fileOffset: number): void {
    if (this.curaText === '') this.curaOffset = fileOffset;
    const space = buf.indexOf(SPACE, i);
    if (this.curaText.length < MAX_TEXT) this.curaText += text(buf, space + 1, end);
  }

  private cura(): void {
    const json = this.curaText.replace(/\\([\\nr])/g, (_, c: string) => (c === 'n' ? '\n' : c === 'r' ? '\r' : '\\'));
    this.curaText = '';
    const entries: [string, string][] = [];
    try {
      const data = JSON.parse(json) as { global_quality?: string; extruder_quality?: string[] };
      for (const ini of [data.global_quality, ...(data.extruder_quality ?? [])]) {
        let values = false;
        for (const raw of (ini ?? '').split(/\r?\n/)) {
          if (raw.startsWith('[')) values = raw.trim() === '[values]';
          const eq = raw.indexOf(' = ');
          if (values && eq > 0 && !/^\s/.test(raw)) entries.push([raw.slice(0, eq), raw.slice(eq + 3)]);
        }
      }
    } catch {
      return this.out.diagnostic('config-invalid', 'warning', this.curaOffset, 'Cura settings text is not valid JSON');
    }
    // the first value of a key wins: the global stack before the extruders
    const seen = new Set<string>();
    this.out.config(entries.filter(([k]) => !seen.has(k) && !!seen.add(k)));
  }

  // labels

  /** `name id:ID copy N`, as PrusaSlicer and Orca write it; the id and copy parts are optional. */
  private open(label: string): void {
    const m = /^(.*?)(?: id:(\S*))?(?: copy (\d+))?$/.exec(label);
    this.begin({
      name: m?.[1] || label,
      ...(m?.[2] ? { id: m[2] } : {}),
      ...(m?.[3] ? { copy: Number(m[3]) } : {}),
      first: this.out.nextMove,
    });
  }

  private mesh(name: string): void {
    if (name === 'NONMESH') this.closeSpan();
    else this.begin({ name, first: this.out.nextMove });
  }

  private begin(span: Span): void {
    this.closeSpan();
    this.span = span;
  }

  private closeSpan(): void {
    const s = this.span;
    this.span = null;
    if (!s || s.first >= this.out.nextMove) return;
    this.out.range(this.labelOf(s), s.first, this.out.nextMove);
  }

  private labelOf(s: Span): { name: string; id?: string; copy?: number } {
    if (s.m486 === undefined) return s.copy === undefined ? idName(s) : { ...idName(s), copy: s.copy };
    return { name: this.names.get(s.m486) ?? String(s.m486), id: String(s.m486) };
  }

  /** `M486 S<index>` starts object `index` (-1: none), `M486 A<name>` names the current one. */
  private m486(args: string): void {
    const s = /(?:^|\s)S(-?\d+)/i.exec(args);
    const a = /(?:^|\s)A(?:"([^"]*)"|([^\s;]+))/i.exec(args);
    if (s) {
      this.m486Current = Number(s[1]);
      this.closeSpan();
    }
    const name = a?.[1] ?? a?.[2];
    if (name !== undefined && this.m486Current >= 0) {
      this.names.set(this.m486Current, name);
      this.out.label({ name, id: String(this.m486Current) });
    }
    if (s && this.m486Current >= 0) this.span = { m486: this.m486Current, first: this.out.nextMove };
  }

  /** `DEFINE NAME=x ...`, `START NAME=x`, `END [NAME=x]`; `rest` is what follows `exclude_object_`. */
  private klipper(rest: string): void {
    const word = /^(define|start|end)\b/i.exec(rest)?.[1]?.toLowerCase();
    const n = /(?:^|\s)NAME=(?:"([^"]*)"|'([^']*)'|(\S+))/i.exec(rest);
    const name = n?.[1] ?? n?.[2] ?? n?.[3];
    if (word === 'end') this.closeSpan();
    else if (name !== undefined && word === 'define') this.out.label({ name });
    else if (name !== undefined && word === 'start') this.begin({ name, first: this.out.nextMove });
  }
}

const idName = (s: Span): { name: string; id?: string } =>
  s.id === undefined ? { name: s.name ?? '' } : { name: s.name ?? '', id: s.id };
