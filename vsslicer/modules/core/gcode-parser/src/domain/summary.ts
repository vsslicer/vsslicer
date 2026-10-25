// SPDX-License-Identifier: AGPL-3.0-or-later
import type { EstimateSeconds, ExtruderUsage, JobSummary } from '@vsslicer/gcode-api';

type Stat = 'lengthMm' | 'volumeCm3' | 'weightG' | 'cost';

/** `; filament used [mm] = 1.0, 2.0` (PrusaSlicer, Orca), `; total filament length [mm] : 1.0` (Bambu Studio header). */
const USAGE: [RegExp, Stat, number][] = [
  [/^filament used \[mm\]\s*=\s*(.*)$/, 'lengthMm', 1],
  [/^filament used \[cm3\]\s*=\s*(.*)$/, 'volumeCm3', 1],
  [/^filament used \[g\]\s*=\s*(.*)$/, 'weightG', 1],
  [/^filament cost\s*=\s*(.*)$/, 'cost', 1],
  [/^total filament length \[mm\]\s*:\s*(.*)$/, 'lengthMm', 1],
  // Bambu Studio labels this cm^3 but writes mm3 (1232.38 mm of 1.75 mm filament = 2964.21)
  [/^total filament volume \[cm\^3\]\s*:\s*(.*)$/, 'volumeCm3', 0.001],
  [/^total filament weight \[g\]\s*:\s*(.*)$/, 'weightG', 1],
];

/** `1d 2h 3m 4s`, any subset; undefined if no unit is found. */
export function parseDuration(text: string): number | undefined {
  const parts = [...text.matchAll(/(\d+)\s*([dhms])\b/g)];
  if (parts.length === 0) return undefined;
  const unit = { d: 86400, h: 3600, m: 60, s: 1 } as const;
  return parts.reduce((n, p) => n + Number(p[1]) * unit[p[2] as keyof typeof unit], 0);
}

const finite = (token: string, scale: number): number | undefined => {
  const t = token.trim();
  return t !== '' && Number.isFinite(Number(t)) ? Number(t) * scale : undefined;
};

/**
 * Collects the slicer's summary comments, fed one comment text (without `;`) at a time. Values
 * the slicer states as 0 for a filament that was fed (weight, volume or cost with unknown density
 * or price: Bambu Studio writes `weight [g] : 0.00`) are dropped; an extruder that fed nothing
 * keeps its zeros. Later lines override earlier ones (PrusaSlicer states the totals twice).
 */
export class SummaryBuilder {
  private readonly extruders: ExtruderUsage[] = [];
  private readonly estimate: EstimateSeconds = {};

  line(raw: string): void {
    const text = raw.trim();
    for (const [re, stat, scale] of USAGE) {
      const list = re.exec(text)?.[1];
      if (list !== undefined) return this.usage(stat, list.split(','), scale);
    }
    const prusa = /^estimated printing time \((normal|silent) mode\)\s*=\s*(.*)$/.exec(text);
    if (prusa) return this.time(prusa[1] as 'normal' | 'silent', prusa[2] ?? '');
    const model = /^model printing time:\s*([^;]*)(?:;\s*total estimated time:\s*(.*))?$/.exec(text);
    if (model) {
      this.time('model', model[1] ?? '');
      return this.time('total', model[2] ?? '');
    }
    const cura = /^TIME:\s*(\d+(?:\.\d+)?)\s*$/.exec(text)?.[1];
    if (cura) this.estimate.total = Math.round(Number(cura));
    const curaLen = /^Filament used:\s*(.*)$/.exec(text)?.[1];
    if (curaLen !== undefined)
      this.usage(
        'lengthMm',
        curaLen.split(',').map((t) => t.replace(/m\s*$/, '')),
        1000,
      );
  }

  private usage(stat: Stat, tokens: string[], scale: number): void {
    tokens.forEach((token, i) => {
      const v = finite(token, scale);
      if (v === undefined) return;
      (this.extruders[i] ??= {})[stat] = v;
    });
  }

  private time(mode: keyof EstimateSeconds, text: string): void {
    const s = parseDuration(text);
    if (s !== undefined) this.estimate[mode] = s;
  }

  build(): JobSummary {
    // Array.from visits holes (map skips them): an extruder with no known stats is {}
    const extruders = Array.from(this.extruders, (e = {}) => {
      const fed = (e.lengthMm ?? 0) > 0;
      const kept = Object.entries(e).filter(([k, v]) => k === 'lengthMm' || v !== 0 || !fed);
      return Object.fromEntries(kept) as ExtruderUsage;
    });
    return Object.keys(this.estimate).length > 0 ? { extruders, estimateSeconds: { ...this.estimate } } : { extruders };
  }
}
