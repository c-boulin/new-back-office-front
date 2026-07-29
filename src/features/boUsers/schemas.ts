import { z } from "zod";

// Tolerant on read: the table only needs role id + name + color. `color` may be
// a hex string, an enum value, or null; `permissions` shape is not consumed here.
const boUserRoleSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string().optional(),
  color: z.string().nullish(),
  permissions: z.unknown().optional(),
});

const boUserProductSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string().optional(),
  slug: z.string().nullish(),
  role: boUserRoleSchema,
});

export const boUserSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string().optional(),
  email: z.string().optional(),
  initials: z.string().optional(),
  lastLogin: z.string().nullish(),
  products: z.array(boUserProductSchema).optional(),
});

const metaSchema = z.object({
  current_page: z.number(),
  last_page: z.number(),
  per_page: z.number(),
  total: z.number(),
  from: z.number().nullish(),
  to: z.number().nullish(),
});

export const paginatedBoUsersSchema = z.object({
  data: z.array(boUserSchema),
  meta: metaSchema,
});

export type RawBoUser = z.infer<typeof boUserSchema>;
export type RawPaginatedBoUsers = z.infer<typeof paginatedBoUsersSchema>;
