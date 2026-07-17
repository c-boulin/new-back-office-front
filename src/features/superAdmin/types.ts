export type PlatformAdminRole = "owner" | "admin" | "read_only";

export type PlatformAdmin = {
  id: string;
  name: string;
  email: string;
  role: PlatformAdminRole;
  lastActiveAt: string | null;
  createdAt: string;
};
