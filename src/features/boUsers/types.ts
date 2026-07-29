import type { RoleColor } from "@/features/permissions/types";

export type BoUserRoleSummary = {
  id: string;
  name: string;
  color: RoleColor;
};

export type BoUserProductAssignment = {
  id: number;
  name: string;
  slug: string | null;
  role: BoUserRoleSummary;
};

export type BoUser = {
  id: number;
  name: string;
  email: string;
  initials: string;
  lastLogin: string | null;
  products: BoUserProductAssignment[];
};

// One role per product. Mirrors the API write body exactly.
export type BoUserAssignmentInput = {
  id: number;
  roleId: string;
};

export type BoUserWriteBody = {
  name: string;
  email: string;
  products: BoUserAssignmentInput[];
};

export type PaginatedBoUsers = {
  items: BoUser[];
  /** 0-based, ready for the table. Derived from `meta.current_page`. */
  pageIndex: number;
  pageCount: number;
  perPage: number;
  total: number;
};
