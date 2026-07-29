import { describe, it, expect } from "vitest";
import { boUserFromRaw, paginatedBoUsersFromRaw } from "@/features/boUsers/adaptors";
import type { RawBoUser, RawPaginatedBoUsers } from "@/features/boUsers/schemas";

const raw: RawBoUser = {
  id: 1,
  name: "  Jane Doe  ",
  email: "jane@example.com",
  initials: "JD",
  lastLogin: "2024-01-01T00:00:00Z",
  products: [
    { id: 10, name: "Woozgo", slug: "woozgo", role: { id: 5, name: "Moderator", color: "info" } },
  ],
};

describe("boUserFromRaw", () => {
  it("coerces the id to a number", () => {
    expect(boUserFromRaw({ ...raw, id: "42" }).id).toBe(42);
  });

  it("sanitizes and trims the name", () => {
    expect(boUserFromRaw(raw).name).toBe("Jane Doe");
  });

  it("keeps provided initials", () => {
    expect(boUserFromRaw(raw).initials).toBe("JD");
  });

  it("computes initials from the name when missing", () => {
    const { initials, ...rest } = raw;
    void initials;
    expect(boUserFromRaw(rest).initials).toBe("JD");
  });

  it("maps product id to number and role id to string", () => {
    const user = boUserFromRaw(raw);
    expect(user.products[0].id).toBe(10);
    expect(user.products[0].role.id).toBe("5");
  });

  it("falls back to a safe role color for a hex value", () => {
    const user = boUserFromRaw({
      ...raw,
      products: [{ id: 10, name: "Woozgo", slug: null, role: { id: 5, color: "#ff0000" } }],
    });
    expect(user.products[0].role.color).toBe("secondary");
  });

  it("keeps a known enum role color", () => {
    expect(boUserFromRaw(raw).products[0].role.color).toBe("info");
  });

  it("defaults a missing lastLogin to null", () => {
    const { lastLogin, ...rest } = raw;
    void lastLogin;
    expect(boUserFromRaw(rest).lastLogin).toBeNull();
  });

  it("tolerates a missing products array", () => {
    const { products, ...rest } = raw;
    void products;
    expect(boUserFromRaw(rest).products).toEqual([]);
  });
});

describe("paginatedBoUsersFromRaw", () => {
  const rawPage: RawPaginatedBoUsers = {
    data: [raw],
    meta: { current_page: 2, last_page: 5, per_page: 15, total: 70, from: 16, to: 30 },
  };

  it("maps meta into 0-based table pagination", () => {
    const page = paginatedBoUsersFromRaw(rawPage);
    expect(page.pageIndex).toBe(1);
    expect(page.pageCount).toBe(5);
    expect(page.perPage).toBe(15);
    expect(page.total).toBe(70);
    expect(page.items).toHaveLength(1);
  });

  it("never returns a negative page index or zero page count", () => {
    const page = paginatedBoUsersFromRaw({
      data: [],
      meta: { current_page: 0, last_page: 0, per_page: 15, total: 0, from: null, to: null },
    });
    expect(page.pageIndex).toBe(0);
    expect(page.pageCount).toBe(1);
  });
});
