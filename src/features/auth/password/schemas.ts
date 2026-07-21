import { z } from "zod";

export const passwordCredentialsSchema = z.object({
  email: z
    .string()
    .min(1, { message: "validation.emailRequired" })
    .email({ message: "validation.emailInvalid" })
    .max(180),
  password: z
    .string()
    .min(1, { message: "validation.passwordRequired" }),
});

export type PasswordCredentialsInput = z.infer<typeof passwordCredentialsSchema>;
