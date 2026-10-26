// SPDX-License-Identifier: AGPL-3.0-or-later
import type {
  Feeder,
  Material,
  Nozzle,
  PrinterInstance,
  PrinterModel,
  Process,
  Settings,
  Surface,
  Vendor,
} from '../../domain/entities/index.ts';
import type { Diagnostic } from '../../domain/import-result/index.ts';
import type { ProfileFormat } from './importer.ts';

/** Entity type per kind; the keys match `entitySchemas`. */
export interface EntityByKind {
  vendor: Vendor;
  printer_model: PrinterModel;
  nozzle: Nozzle;
  surface: Surface;
  feeder: Feeder;
  material: Material;
  process: Process;
  printer_instance: PrinterInstance;
}
export type EntityKind = keyof EntityByKind;

/** Every given field must match. */
export interface ProfileQuery {
  vendor?: string;
  /** Matches any value in `Material.external_ids` (Bambu filament_id, Orca id, Prusa name, Cura GUID). */
  external_id?: string;
}

/** One value per part of the tuple: materials in extruder order. */
export interface ProfileParts<T> {
  printer: T;
  materials: T[];
  process: T;
}

export interface ResolvedProfile {
  unified: ProfileParts<Settings>;
  /** The same tuple in each native format the store can emit. */
  native: Partial<Record<ProfileFormat, ProfileParts<Settings>>>;
}

export interface ProfileStoreChange {
  /** Ids of the entities added, changed or removed. */
  ids: string[];
  diagnostics: Diagnostic[];
}

export interface Disposable {
  dispose(): void;
}

/** The read side. Async and serialisable throughout, so it can be proxied from a worker. */
export interface ProfileStore {
  get<K extends EntityKind>(kind: K, id: string): Promise<EntityByKind[K] | undefined>;
  list<K extends EntityKind>(kind: K): Promise<EntityByKind[K][]>;
  query<K extends EntityKind>(kind: K, query: ProfileQuery): Promise<EntityByKind[K][]>;
  /** Arguments are entity ids; rejects when one is unknown. */
  resolve(printerInstance: string, materials: readonly string[], process: string): Promise<ResolvedProfile>;
  compatibleMaterials(printerInstance: string): Promise<Material[]>;
  compatibleProcesses(printerInstance: string): Promise<Process[]>;
  onDidChange(listener: (change: ProfileStoreChange) => void): Disposable;
}
