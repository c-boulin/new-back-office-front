import { describe, it, expect } from "vitest";
import { passwordCredentialsSchema } from "@/features/auth/password/schemas";

describe("passwordCredentialsSchema", () => {
  it("accepts a valid email + password", () => {
    expect(() =>
      passwordCredentialsSchema.parse({ email: "alice@example.com", password: "pw" }),
    ).not.toThrow();
  });

  it("rejects empty email", () => {
    expect(() =>
      passwordCredentialsSchema.parse({ email: "", password: "pw" }),
    ).toThrow();
  });

  it("rejects malformed email", () => {
    expect(() =>
      passwordCredentialsSchema.parse({ email: "not-an-email", password: "pw" }),
    ).toThrow();
  });

  it("rejects empty password", () => {
    expect(() =>
      passwordCredentialsSchema.parse({ email: "alice@example.com", password: "" }),
    ).toThrow();
  });
});
