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

export const membershipSchema = z.object({
  tenant_id: z.string(),
  tenant_slug: z.string(),
  tenant_name: z.string(),
  role: z.enum(["owner", "admin", "moderator", "viewer"]),
  permissions: z.array(z.string()),
  theme: tenantThemeSchema.nullable(),
  last_accessed_at: z.string().nullable(),
});

export const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatar_url: z.string().nullable(),
  is_super_admin: z.boolean(),
});

export const meResponseSchema = z.object({
  user: authUserSchema,
  memberships: z.array(membershipSchema),
});

export type RawTenant = z.infer<typeof tenantSchema>;
export type RawTenantTheme = z.infer<typeof tenantThemeSchema>;
export type RawMembership = z.infer<typeof membershipSchema>;
export type RawAuthUser = z.infer<typeof authUserSchema>;
export type RawMeResponse = z.infer<typeof meResponseSchema>;
