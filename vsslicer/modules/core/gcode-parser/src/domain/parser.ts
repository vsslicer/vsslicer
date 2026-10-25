// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Chunk, Slicer } from '@vsslicer/gcode-api';
import { ChunkWriter } from './chunk-writer.ts';
import { Machine } from './machine.ts';
import type { Flavour } from './machine.ts';
import { SlicerTags } from './slicer-tags.ts';
import { Tokens } from './tokeniser.ts';

export interface ParserOptions {
  /**
   * Firmware dialect for flavour-dependent units. Overrides detection; when absent the parser uses
   * the flavour the file names (`;FLAVOR:`, `; gcode_flavor =`) from that line on, and `marlin`
   * before that and when the file names none.
   */
  flavour?: Flavour;
  /** A chunk ends after this many moves. Default 65536 (about 2.2 MB of buffers). */
  chunkMoves?: number;
  /** A chunk also ends after this many decoded bytes, so a comment-heavy file still reports progress. Default 4 MiB. */
  chunkBytes?: number;
  /** Decoded-text offset of the first byte, for resuming and for testing the 4 GiB rule. Default 0. */
  baseOffset?: number;
}

const U32_MAX = 0xffffffff;
const MAX_LINE = 1 << 20;
const NEWLINE = 0x0a;
const BOM = [0xef, 0xbb, 0xbf];

/**
 * Splits a byte stream into lines (a line may straddle input chunks), runs them through the
 * machine and yields `Chunk`s. Pure and synchronous: `feed` for each input piece, then `end`.
 */
export class GCodeParser {
  readonly machine: Machine;
  private readonly tags: SlicerTags;
  private readonly writer: ChunkWriter;
  private readonly tokens = new Tokens();
  private readonly chunkBytes: number;
  private readonly base: number;
  private offset: number;
  private chunkStart: number;
  private carry: Uint8Array | null = null;
  private skipped = 0;
  private skipping = false;
  /** True once the parse has ended early (4 GiB offset overflow); further input is ignored. */
  done = false;
  /** Leading UTF-8 BOM bytes still to match; 0 once past it (or when resuming at a base offset). */
  private bomLeft = 3;

  constructor(opts: ParserOptions = {}) {
    this.writer = new ChunkWriter(opts.chunkMoves ?? 65536);
    this.machine = new Machine(this.writer, opts.flavour ?? 'marlin');
    this.tags = new SlicerTags(this.writer, this.machine, opts.flavour !== undefined);
    this.chunkBytes = opts.chunkBytes ?? 4 << 20;
    this.base = opts.baseOffset ?? 0;
    this.offset = this.base;
    this.chunkStart = this.base;
    if (this.base > 0) this.bomLeft = 0;
  }

  /** Detected slicer; `unknown` until the header has been read. */
  get slicer(): Slicer {
    return this.tags.slicer;
  }

  /** The flavour units are read with now: the option, else the detected one, else `marlin`. */
  get flavour(): Flavour {
    return this.machine.flavour;
  }

  *feed(input: Uint8Array): Generator<Chunk> {
    let pos = 0;
    // shortcut: a stream starting with a partial BOM (EF BB, then other bytes) loses those bytes; not valid text anyway
    while (this.bomLeft > 0 && pos < input.length) {
      if (input[pos] !== BOM[3 - this.bomLeft]) this.bomLeft = 0;
      else {
        this.bomLeft--;
        pos++;
        this.offset++;
      }
    }
    while (pos < input.length && !this.done) {
      const nl = input.indexOf(NEWLINE, pos);
      if (nl < 0) {
        this.stash(input.subarray(pos));
        return;
      }
      const consumed = nl + 1 - pos;
      if (this.skipping) {
        this.skipping = false;
        this.offset += this.skipped + consumed;
        this.skipped = 0;
      } else if (this.carry) {
        const line = new Uint8Array(this.carry.length + nl - pos);
        line.set(this.carry);
        line.set(input.subarray(pos, nl), this.carry.length);
        const length = this.carry.length;
        this.carry = null;
        this.line(line, line.length);
        this.offset += length + consumed;
      } else {
        this.line(input.subarray(pos, nl), nl - pos);
        this.offset += consumed;
      }
      pos = nl + 1;
      if (this.writer.full || (!this.writer.empty && this.offset - this.chunkStart >= this.chunkBytes)) {
        yield this.take();
      }
    }
  }

  /** Finishes the file: parses a last line without line break and yields the final chunk. */
  *end(): Generator<Chunk> {
    if (this.carry && !this.done) {
      this.line(this.carry, this.carry.length);
      this.offset += this.carry.length;
    }
    this.carry = null;
    this.offset += this.skipped;
    this.tags.finish(this.offset);
    // no empty trailing chunk: the final one exists only if it holds something
    if (!this.writer.empty) yield this.take();
  }

  private take(): Chunk {
    this.chunkStart = this.offset;
    return this.writer.take(this.offset - this.base, this.slicer);
  }

  private stash(rest: Uint8Array): void {
    if (this.skipping) {
      this.skipped += rest.length;
      return;
    }
    const length = (this.carry?.length ?? 0) + rest.length;
    if (length > MAX_LINE) {
      this.writer.diagnostic('line-too-long', 'warning', this.offset, `line longer than ${MAX_LINE} bytes skipped`);
      this.skipping = true;
      this.skipped = length;
      this.carry = null;
      return;
    }
    const next = new Uint8Array(length);
    if (this.carry) next.set(this.carry);
    next.set(rest, this.carry?.length ?? 0);
    this.carry = next;
  }

  private line(buf: Uint8Array, length: number): void {
    if (this.offset > U32_MAX) {
      this.writer.diagnostic(
        'offset-overflow',
        'error',
        U32_MAX,
        'decoded text passes 4 GiB; file offsets are u32, parse stopped',
      );
      this.done = true;
      return;
    }
    let end = length;
    if (end > 0 && buf[end - 1] === 0x0d) end--;
    if (this.tokens.tokenise(buf, 0, end)) this.machine.handle(this.tokens, this.offset);
    else this.tags.handle(buf, end, this.offset);
  }
}
