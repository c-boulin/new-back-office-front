export type TenantSettings = {
  tenantName: string;
  supportEmail: string;
  timezone: string;
  locale: string;
  featureFlags: Record<string, boolean>;
  brandPrimary: string;
  brandAccent: string;
};

export type UpdateTenantSettings = Partial<TenantSettings>;
