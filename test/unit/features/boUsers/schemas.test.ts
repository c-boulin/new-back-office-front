import { describe, it, expect } from "vitest";
import { boUserSchema, paginatedBoUsersSchema } from "@/features/boUsers/schemas";

const validUser = {
  id: 1,
  name: "Jane Doe",
  email: "jane@example.com",
  initials: "JD",
  lastLogin: "2024-01-01T00:00:00Z",
  products: [
    { id: 10, name: "Woozgo", slug: "woozgo", role: { id: 5, name: "Moderator", color: "info" } },
  ],
};

describe("boUserSchema", () => {
  it("accepts a well-formed user", () => {
    expect(boUserSchema.safeParse(validUser).success).toBe(true);
  });

  it("accepts a string id", () => {
    expect(boUserSchema.safeParse({ ...validUser, id: "1" }).success).toBe(true);
  });

  it("accepts a hex role color", () => {
    const user = {
      ...validUser,
      products: [{ id: 10, name: "Woozgo", slug: null, role: { id: 5, color: "#ff0000" } }],
    };
    expect(boUserSchema.safeParse(user).success).toBe(true);
  });

  it("accepts a user with no products", () => {
    const { products, ...rest } = validUser;
    void products;
    expect(boUserSchema.safeParse(rest).success).toBe(true);
  });

  it("rejects a non-object payload", () => {
    expect(boUserSchema.safeParse("nope").success).toBe(false);
  });
});

describe("paginatedBoUsersSchema", () => {
  const meta = { current_page: 1, last_page: 1, per_page: 15, total: 1 };

  it("parses a data + meta envelope", () => {
    expect(paginatedBoUsersSchema.safeParse({ data: [validUser], meta }).success).toBe(true);
  });

  it("rejects a payload without meta", () => {
    expect(paginatedBoUsersSchema.safeParse({ data: [validUser] }).success).toBe(false);
  });

  it("rejects a non-array data field", () => {
    expect(paginatedBoUsersSchema.safeParse({ data: validUser, meta }).success).toBe(false);
  });
});
