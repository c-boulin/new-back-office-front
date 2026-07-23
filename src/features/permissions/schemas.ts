import { z } from "zod";

export const ROLE_COLORS = [
  "error",
  "warning",
  "info",
  "success",
  "primary",
  "secondary",
] as const;

export const roleColorSchema = z.enum(ROLE_COLORS);

export const rolePermissionMatrixSchema = z.record(
  z.string(),
  z.record(z.string(), z.boolean()),
);

export const roleSchema = z.object({
  id: z.string(),
  label: z.string(),
  color: roleColorSchema.nullable(),
  isLocked: z.boolean(),
  permissions: rolePermissionMatrixSchema,
  createdAt: z.string().nullable(),
});

export const rolesResponseSchema = z.object({
  data: z.array(roleSchema),
});

export const roleResponseSchema = z.object({
  data: roleSchema,
});

export type RawRole = z.infer<typeof roleSchema>;
export type RawRoleColor = z.infer<typeof roleColorSchema>;
export type RawRoleMatrix = z.infer<typeof rolePermissionMatrixSchema>;
