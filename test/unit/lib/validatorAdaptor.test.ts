import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  validateAndAdapt,
  validateAndAdaptList,
  ValidationError,
} from "@/lib/validatorAdaptor";

const schema = z.object({ user_id: z.string(), age: z.number() });
type Raw = z.infer<typeof schema>;
type Domain = { userId: string; age: number };

const adapt = (raw: Raw): Domain => ({ userId: raw.user_id, age: raw.age });

describe("validateAndAdapt", () => {
  it("parses valid raw and applies adaptor", () => {
    expect(validateAndAdapt({ user_id: "u1", age: 30 }, schema, adapt)).toEqual({
      userId: "u1",
      age: 30,
    });
  });

  it("throws ValidationError with issues on shape drift", () => {
    try {
      validateAndAdapt({ user_id: "u1", age: "old" }, schema, adapt);
      throw new Error("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as ValidationError).issues).toBeDefined();
    }
  });

  it("throws when required field is missing", () => {
    expect(() =>
      validateAndAdapt({ user_id: "u1" }, schema, adapt),
    ).toThrow(ValidationError);
  });
});

describe("validateAndAdaptList", () => {
  it("maps each item through validate + adapt", () => {
    const out = validateAndAdaptList(
      [
        { user_id: "u1", age: 30 },
        { user_id: "u2", age: 40 },
      ],
      schema,
      adapt,
    );
    expect(out).toEqual([
      { userId: "u1", age: 30 },
      { userId: "u2", age: 40 },
    ]);
  });

  it("throws when payload is not an array", () => {
    expect(() =>
      validateAndAdaptList({ user_id: "u1", age: 30 }, schema, adapt),
    ).toThrow(ValidationError);
  });

  it("throws when any item is invalid", () => {
    expect(() =>
      validateAndAdaptList(
        [{ user_id: "u1", age: 30 }, { user_id: "u2" }],
        schema,
        adapt,
      ),
    ).toThrow(ValidationError);
  });
});
