import { z } from "zod";

export const roleColorSchema = z.enum([
  "error",
  "warning",
  "info",
  "success",
  "primary",
  "secondary",
]);

export const roleSchema = z.object({
  id: z.string(),
  label: z.string(),
  color: roleColorSchema,
  isLocked: z.boolean(),
  permissions: z.record(z.string(), z.record(z.string(), z.boolean())),
  createdAt: z.string().nullable(),
});

export const rolesResponseSchema = z.object({
  data: z.array(roleSchema),
});

export type RawRole = z.infer<typeof roleSchema>;
export type RawRolesResponse = z.infer<typeof rolesResponseSchema>;
