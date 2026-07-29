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

// The live API returns a bare array; a { data: [...] } envelope is also
// accepted so the code keeps working if the backend later wraps it.
export const rolesResponseSchema = z.union([
  z.array(roleSchema),
  z.object({ data: z.array(roleSchema) }),
]);

export type RawRole = z.infer<typeof roleSchema>;
export type RawRolesResponse = z.infer<typeof rolesResponseSchema>;
