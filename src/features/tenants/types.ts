export type TenantTheme = {
  primary: string;
  accent: string;
  background: string;
  foreground: string;
  radius: string;
  fontSans: string;
  card?: string;
  cardForeground?: string;
  popover?: string;
  popoverForeground?: string;
  secondary?: string;
  secondaryForeground?: string;
  muted?: string;
  mutedForeground?: string;
  border?: string;
  input?: string;
  ring?: string;
  primaryForeground?: string;
  accentForeground?: string;
};

export type Tenant = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  status: "active" | "suspended" | "provisioning";
  theme: TenantTheme;
  featureFlags: Record<string, boolean>;
  createdAt: string;
  usersCount: number;
};

export type TenantMembership = {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  role: "owner" | "admin" | "moderator" | "viewer";
  permissions: string[];
  theme: TenantTheme | null;
  lastAccessedAt: string | null;
};
