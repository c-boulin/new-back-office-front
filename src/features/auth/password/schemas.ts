import { z } from "zod";

export const passwordCredentialsSchema = z.object({
  username: z
    .string()
    .min(1, { message: "validation.usernameRequired" })
    .max(180),
  password: z
    .string()
    .min(1, { message: "validation.passwordRequired" }),
});

export type PasswordCredentialsInput = z.infer<typeof passwordCredentialsSchema>;
