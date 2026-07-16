import { z } from "zod";
import { authUserSchema, membershipSchema } from "@/features/tenants/schemas";

export const passwordCredentialsSchema = z.object({
  identifier: z
    .string()
    .min(1, { message: "validation.identifierRequired" })
    .max(120),
  password: z
    .string()
    .min(1, { message: "validation.passwordRequired" }),
});

export const passwordSessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.number().int().positive(),
  user: authUserSchema,
  memberships: z.array(membershipSchema),
});

export type RawPasswordSession = z.infer<typeof passwordSessionSchema>;
export type PasswordCredentialsInput = z.infer<typeof passwordCredentialsSchema>;
