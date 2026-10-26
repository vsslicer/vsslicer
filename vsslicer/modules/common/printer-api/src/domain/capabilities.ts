// SPDX-License-Identifier: AGPL-3.0-or-later

/** Every optional thing a connector can do (printer-connectivity.md section 6, incl. emergencyStop, temperatureControl, motionControl at :184-188, plus downloadFile and moveFile for printer://). */
export const CAPABILITY_FLAGS = [
  'upload',
  'uploadAndStart',
  'start',
  'pause',
  'resume',
  'cancel',
  'emergencyStop',
  'listFiles',
  'downloadFile', // printer:// reads file bytes
  'deleteFile',
  'moveFile', // printer:// rename and move
  'fileMetadata',
  'thumbnails',
  'telemetryPush',
  'telemetryPoll',
  'rawGcode',
  'temperatureControl',
  'motionControl',
  'webcamSnapshot',
  'webcamStream',
  'queue',
  'history',
  'multiMaterial',
  'filamentSync',
  'discovery',
  'pairing',
  'remoteWorkspaceSafe',
] as const;

export type CapabilityFlag = (typeof CAPABILITY_FLAGS)[number];

/** Printer modes a flag can be gated on. Bambu's write commands need Developer Mode (LAN). */
export const PRINTER_MODES = { developerMode: 'Developer Mode' } as const;
export type PrinterMode = keyof typeof PRINTER_MODES;

/** readOnly: the flag changes nothing on the printer. requiresMode: usable only while that mode is on. */
export interface CapabilityAnnotation {
  readonly readOnly?: boolean;
  readonly requiresMode?: PrinterMode;
}

/** What an adapter declares, plus the modes currently active on the connected printer. */
export interface Capabilities {
  readonly flags: ReadonlyMap<CapabilityFlag, CapabilityAnnotation>;
  readonly activeModes: ReadonlySet<PrinterMode>;
}

/** The only place a consumer tests a capability: declared, and its required mode (if any) is on. */
export function can(caps: Capabilities, flag: CapabilityFlag): boolean {
  const a = caps.flags.get(flag);
  if (a === undefined) return false;
  return a.requiresMode === undefined || caps.activeModes.has(a.requiresMode);
}

/** Flags that change the printer; classified here, not per adapter, so an un-annotated `discovery` cannot make a printer look writable. */
export const MUTATING_FLAGS: ReadonlySet<CapabilityFlag> = new Set<CapabilityFlag>([
  'upload',
  'uploadAndStart',
  'start',
  'pause',
  'resume',
  'cancel',
  'emergencyStop',
  'deleteFile',
  'moveFile',
  'rawGcode',
  'temperatureControl',
  'motionControl',
  'queue',
  'filamentSync',
]);

/** Declared mutating flags (an adapter's readOnly: true can still exempt one). */
const mutating = (caps: Capabilities) =>
  [...caps.flags].filter(([f, a]) => MUTATING_FLAGS.has(f) && a.readOnly !== true);

/** True when no mutating flag is usable (Bambu without Developer Mode: read-only status, bambu-connectivity.md:85,165,169). */
export function isReadOnly(caps: Capabilities): boolean {
  return !mutating(caps).some(([flag]) => can(caps, flag));
}

/** Why the printer is read-only, or undefined when it is not (or has nothing to gate on). */
export function readOnlyReason(caps: Capabilities): string | undefined {
  if (!isReadOnly(caps)) return undefined;
  const mode = mutating(caps).find(([, a]) => a.requiresMode !== undefined)?.[1].requiresMode;
  return mode === undefined ? undefined : `requires ${PRINTER_MODES[mode]}`;
}
