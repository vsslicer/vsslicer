// SPDX-License-Identifier: AGPL-3.0-or-later
// Subpath entry `@vsslicer/profiles-cura/materials`: only consumers that read materials load the XML parser (saxes).
export { FDM_XML_LIMITS, readFdmMaterialFolder, readFdmMaterials } from './adapters/materials/fdm-material.ts';
export type { FdmMaterials } from './adapters/materials/fdm-material.ts';
