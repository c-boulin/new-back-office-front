export type BoUserRoleSummary = {
  id: string;
  name: string;
  color: string;
};

export type BoUserProduct = {
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
  products: BoUserProduct[];
};

export type PaginatedBoUsers = {
  items: BoUser[];
  pageIndex: number;
  pageCount: number;
  perPage: number;
  total: number;
};

export type BoUserProductAssignment = {
  id: number;
  roleId: string;
};

export type BoUserWriteBody = {
  name: string;
  email: string;
  products: BoUserProductAssignment[];
};
