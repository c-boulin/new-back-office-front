import { BACKOFFICE_SECTIONS } from "./types";
import type { PermissionMatrix } from "./types";

/**
 * Produces a matrix covering exactly the catalog sections/actions, resolving
 * every cell to a boolean. Missing keys in the source become `false`. Used both
 * when reading a role (normalize) and when writing one (send a full matrix).
 */
export function buildPermissionMatrix(source?: PermissionMatrix): PermissionMatrix {
  const matrix: PermissionMatrix = {};
  for (const [section, actions] of Object.entries(BACKOFFICE_SECTIONS)) {
    matrix[section] = {};
    for (const action of actions) {
      matrix[section][action] = source?.[section]?.[action] === true;
    }
  }
  return matrix;
}
