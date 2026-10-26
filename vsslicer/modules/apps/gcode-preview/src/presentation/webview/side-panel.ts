// SPDX-License-Identifier: AGPL-3.0-or-later
// The side panel next to the view: thumbnails, summary, object labels and the plate picker. Everything the
// file supplies reaches the DOM as textContent (or an object URL of a vetted PNG), never as markup.
import type { Diagnostic } from '@vsslicer/gcode-api';
import type { Flag } from '../../domain/flags.ts';
import type { PanelModel } from '../../domain/panel.ts';
import type { TextWindow } from '../../domain/text-window.ts';

export interface PanelHandlers {
  /** The pointer or keyboard focus entered (index) or left (undefined) a label. */
  onHover(index: number | undefined): void;
  onPlate(plate: number): void;
  /** A diagnostic's 'go to offset' or the pane's button: show the file text at this byte offset. */
  onGoTo(offset: number): void;
  /** The pane's 'current move' button. */
  onCurrent(): void;
  /** An address the `<img>` can load for a PNG (a blob URL in the webview). */
  imageUrl(data: Uint8Array): string;
  /** Called for every address `imageUrl` made, when the panel is replaced. */
  releaseUrl(url: string): void;
}

export interface SidePanel {
  element: HTMLElement;
  /** Shows the lines of a text window in the pane. */
  showText(w: TextWindow): void;
  /** Frees the image addresses. */
  dispose(): void;
}

const duration = (s: number): string =>
  `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${Math.round(s % 60)}s`;

/**
 * `doc` is the document (any object with `createElement`, so tests can pass a fake one).
 * `ours` is the planner's total time in seconds, shown next to the slicer's estimates.
 */
/** Diagnostics, flags and the text pane; `text` is false when the file's offsets are not file offsets. */
export interface Issues {
  diagnostics: Diagnostic[];
  diagnosticCount: number;
  flags: Flag[];
  text: boolean;
}

export const renderPanel = (
  doc: Pick<Document, 'createElement'>,
  model: PanelModel,
  ours: { seconds: number; planner: string },
  h: PanelHandlers,
  issues: Issues = { diagnostics: [], diagnosticCount: 0, flags: [], text: false },
): SidePanel => {
  const urls: string[] = [];
  const el = <K extends keyof HTMLElementTagNameMap>(tag: K, text?: string, ...kids: Node[]) => {
    const e = doc.createElement(tag);
    if (text !== undefined) e.textContent = text;
    e.append(...kids);
    return e;
  };
  const root = el('aside');
  root.setAttribute('aria-label', 'Job information');

  if (issues.flags.length > 0) {
    const banner = el('ul');
    banner.setAttribute('role', 'status');
    for (const f of issues.flags) banner.append(el('li', f.text));
    root.append(el('h3', 'Caveats'), banner);
  }

  if (model.plateCount > 0) {
    const select = el('select');
    select.setAttribute('aria-label', 'Plate');
    for (const p of model.plates) {
      const o = el('option', `Plate ${p}`);
      o.value = String(p);
      select.append(o);
    }
    select.value = String(model.plate);
    select.addEventListener('change', () => h.onPlate(Number(select.value)));
    root.append(select);
    if (model.plateCount > model.plates.length)
      root.append(el('p', `Showing ${model.plates.length} of ${model.plateCount} plates`));
  }

  for (const t of model.thumbnails) {
    const img = el('img');
    const url = h.imageUrl(t.data);
    urls.push(url);
    img.src = url;
    img.alt = 'Thumbnail of the print';
    img.style.maxWidth = '100%';
    root.append(img);
  }

  const summary = el('ul');
  summary.append(el('li', `Our estimate: ${duration(ours.seconds)} (${ours.planner})`));
  if (model.slicerEstimates.length === 0) summary.append(el('li', 'Slicer estimate: not stated in the file'));
  for (const e of model.slicerEstimates)
    summary.append(el('li', `Slicer estimate (${e.label}): ${duration(e.seconds)}`));
  for (const l of model.lines) summary.append(el('li', l));
  root.append(el('h3', 'Summary'), summary);

  if (model.labels.length > 0) {
    const list = el('ul');
    model.labels.forEach((label, i) => {
      const li = el('li', label.text);
      li.tabIndex = 0;
      li.addEventListener('mouseenter', () => h.onHover(i));
      li.addEventListener('mouseleave', () => h.onHover(undefined));
      li.addEventListener('focus', () => h.onHover(i));
      li.addEventListener('blur', () => h.onHover(undefined));
      list.append(li);
    });
    const shown =
      model.labels.length < model.labelCount ? ` (first ${model.labels.length} of ${model.labelCount})` : '';
    root.append(el('h3', `Objects${shown}`), list);
  }

  if (issues.diagnostics.length > 0 || issues.diagnosticCount > 0) {
    const list = el('ul');
    for (const d of issues.diagnostics) {
      const go = el('button', `Go to offset ${d.fileOffset}`);
      go.addEventListener('click', () => h.onGoTo(d.fileOffset));
      list.append(el('li', `${d.severity} ${d.code}: ${d.message} `, ...(issues.text ? [go] : [])));
    }
    const more =
      issues.diagnostics.length < issues.diagnosticCount
        ? ` (first ${issues.diagnostics.length} of ${issues.diagnosticCount})`
        : '';
    root.append(el('h3', `Diagnostics${more}`), list);
  }

  const lines = el('pre');
  lines.setAttribute('aria-label', 'G-code text');
  if (issues.text) {
    const cur = el('button', 'Show current move');
    cur.addEventListener('click', () => h.onCurrent());
    root.append(el('h3', 'G-code'), cur, lines);
  } else root.append(el('p', 'The G-code text is shown for plain .gcode files only.'));

  return {
    element: root,
    showText(w) {
      lines.replaceChildren(
        ...w.lines.map((l, i) => {
          const row = el('div', `${l.offset}: ${l.text}${l.clipped ? ' ...' : ''}`);
          if (i === w.focus) {
            row.setAttribute('aria-current', 'true');
            row.style.fontWeight = 'bold';
          }
          return row;
        }),
      );
      if (w.focus < 0) lines.append(el('div', 'Past the end of the file.'));
    },
    dispose: () => urls.splice(0).forEach(h.releaseUrl),
  };
};
