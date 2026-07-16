import type { ZodSchema, ZodTypeDef } from "zod";

export class ValidationError extends Error {
  override readonly name = "ValidationError";
  constructor(
    message: string,
    public readonly issues: unknown,
  ) {
    super(message);
  }
}

/**
 * Runs a raw API payload through a Zod schema then through an adaptor that
 * shapes it into a UI-facing domain model. Any structural drift between the
 * backend and the frontend is caught here, at the edge, before it can bleed
 * into components.
 */
export function validateAndAdapt<Raw, Domain, Def extends ZodTypeDef>(
  raw: unknown,
  schema: ZodSchema<Raw, Def>,
  adapt: (parsed: Raw) => Domain,
): Domain {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ValidationError("Response failed validation", result.error.issues);
  }
  return adapt(result.data);
}

export function validateAndAdaptList<Raw, Domain, Def extends ZodTypeDef>(
  raw: unknown,
  schema: ZodSchema<Raw, Def>,
  adapt: (parsed: Raw) => Domain,
): Domain[] {
  if (!Array.isArray(raw)) {
    throw new ValidationError("Expected array payload", raw);
  }
  return raw.map((item) => validateAndAdapt(item, schema, adapt));
}
