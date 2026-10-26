// SPDX-License-Identifier: AGPL-3.0-or-later
// What the colour modes are called and what a legend needs to show for each (pure). The colours themselves are
// webview-kit's palette texture; this says only which kind of key to draw and over which range.
import { ColorMode } from '@vsslicer/webview-kit/gl';

/** Modes webview-kit 0.5.0 can colour. Width, flow, fan and temperature need a kit change (GCP-32 Progress). */
export const COLOR_MODES = [
  { mode: ColorMode.Feature, label: 'Feature' },
  { mode: ColorMode.Speed, label: 'Speed', unit: 'mm/s' },
  { mode: ColorMode.Tool, label: 'Tool' },
  { mode: ColorMode.LayerTime, label: 'Layer time', unit: 's' },
] as const;

export interface Legend {
  label: string;
  /** `categories`: one swatch per feature or tool; `gradient`: low to high over `range`. */
  kind: 'categories' | 'gradient';
  unit?: string;
  range?: readonly [number, number];
}

export const legendFor = (
  mode: ColorMode,
  ranges: { speed: readonly [number, number]; layerTime: readonly [number, number] } | undefined,
): Legend => {
  const m = COLOR_MODES.find((x) => x.mode === mode) ?? COLOR_MODES[0];
  if (m.mode === ColorMode.Speed) return { label: m.label, kind: 'gradient', unit: m.unit, range: ranges?.speed };
  if (m.mode === ColorMode.LayerTime)
    return { label: m.label, kind: 'gradient', unit: m.unit, range: ranges?.layerTime };
  return { label: m.label, kind: 'categories' };
};
