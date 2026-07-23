import { z } from "zod";

export const tenantThemeSchema = z.object({
  primary: z.string(),
  accent: z.string(),
  background: z.string(),
  foreground: z.string(),
  radius: z.string(),
  font_sans: z.string(),
  card: z.string().optional(),
  card_foreground: z.string().optional(),
  popover: z.string().optional(),
  popover_foreground: z.string().optional(),
  secondary: z.string().optional(),
  secondary_foreground: z.string().optional(),
  muted: z.string().optional(),
  muted_foreground: z.string().optional(),
  border: z.string().optional(),
  input: z.string().optional(),
  ring: z.string().optional(),
  primary_foreground: z.string().optional(),
  accent_foreground: z.string().optional(),
});

export const tenantSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  logo_url: z.string().nullable(),
  status: z.enum(["active", "suspended", "provisioning"]),
  theme: tenantThemeSchema,
  feature_flags: z.record(z.string(), z.boolean()),
  created_at: z.string(),
  users_count: z.number().int().nonnegative(),
});

export const apiRoleSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
});

export const apiProductSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  slug: z.string().nullable().optional(),
  role: apiRoleSchema,
  permissions: z.array(z.string()).optional(),
});

export const apiUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  role: apiRoleSchema.nullable().optional(),
  permissions: z.array(z.string()).optional(),
  products: z.array(apiProductSchema),
});

export const loginResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  user: apiUserSchema,
});

export const meResponseSchema = z.object({
  user: apiUserSchema,
});

export const ssoInitResponseSchema = z.object({
  data: z.object({
    url: z.string().url(),
  }),
});

export type RawTenant = z.infer<typeof tenantSchema>;
export type RawTenantTheme = z.infer<typeof tenantThemeSchema>;
export type RawApiRole = z.infer<typeof apiRoleSchema>;
export type RawApiProduct = z.infer<typeof apiProductSchema>;
export type RawApiUser = z.infer<typeof apiUserSchema>;
export type RawLoginResponse = z.infer<typeof loginResponseSchema>;
export type RawMeResponse = z.infer<typeof meResponseSchema>;
export type RawSsoInitResponse = z.infer<typeof ssoInitResponseSchema>;
