export type FeatureFlag = {
  key: string;
  label: string;
  enabled: boolean;
  description: string;
};

export type TenantSettings = {
  general: {
    name: string;
    slug: string;
    contactEmail: string;
    timezone: string;
  };
  moderation: {
    autoFlagThreshold: number;
    requirePhotoVerification: boolean;
    allowAnonymousReports: boolean;
  };
  notifications: {
    emailOnNewReport: boolean;
    emailOnEscalation: boolean;
    weeklyDigest: boolean;
  };
  featureFlags: FeatureFlag[];
};

export type SettingsUpdatePayload = Partial<{
  general: Partial<TenantSettings["general"]>;
  moderation: Partial<TenantSettings["moderation"]>;
  notifications: Partial<TenantSettings["notifications"]>;
}>;
