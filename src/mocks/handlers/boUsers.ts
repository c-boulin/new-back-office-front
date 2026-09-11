import { AppError } from "@/lib/httpClient";
import type { RawBoUser, RawPaginatedBoUsers } from "@/features/boUsers/schemas";
import { buildBoUserSeeds } from "../seeds/boUsers";

let nextId = 1_000;
const store: RawBoUser[] = [];

function ensureSeeded(): RawBoUser[] {
  if (store.length === 0) {
    store.push(...buildBoUserSeeds());
  }
  return store;
}

type Params = Record<string, string | undefined>;

export function list(params: Params): RawPaginatedBoUsers {
  const all = ensureSeeded();
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const perPage = Math.max(1, Number(params.per_page ?? "15") || 15);
  const total = all.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const items = all.slice(start, start + perPage);
  return {
    data: items,
    meta: {
      current_page: page,
      last_page: lastPage,
      per_page: perPage,
      total,
      from: items.length > 0 ? start + 1 : null,
      to: items.length > 0 ? start + items.length : null,
    },
  };
}

function findById(id: number): RawBoUser | null {
  return ensureSeeded().find((u) => Number(u.id) === id) ?? null;
}

function toAssignmentBody(raw: unknown): { id: number; roleId: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((e): e is { id: number; roleId: string } =>
      typeof e === "object" && e !== null && "id" in e && "roleId" in e,
    )
    .map((e) => ({ id: Number(e.id), roleId: String(e.roleId) }));
}

const ALL_PRODUCTS = [
  { id: 101, name: "Woozgo", slug: "woozgo" },
  { id: 102, name: "Weezchat FR", slug: "weezchat-fr" },
  { id: 103, name: "Weezchat CI", slug: "weezchat-ci" },
  { id: 104, name: "Toolov SK", slug: "toolov-sk" },
  { id: 105, name: "Weezchat TG", slug: "weezchat-tg" },
  { id: 106, name: "Swipi", slug: "swipi" },
];

const ROLE_NAMES: Record<string, { name: string; color: string }> = {
  admin: { name: "Admin", color: "primary" },
  moderator: { name: "Moderator", color: "info" },
  viewer: { name: "Viewer", color: "secondary" },
};

function enrichAssignments(assignments: { id: number; roleId: string }[]) {
  return assignments.map((a) => {
    const product = ALL_PRODUCTS.find((p) => p.id === a.id);
    const role = ROLE_NAMES[a.roleId] ?? { name: a.roleId, color: "secondary" };
    return {
      id: a.id,
      name: product?.name ?? `Product ${a.id}`,
      slug: product?.slug ?? null,
      role: { id: a.roleId, ...role },
    };
  });
}

export function create(body: unknown): RawBoUser {
  const raw = (body ?? {}) as { name?: string; email?: string; products?: unknown };
  if (!raw.name || !raw.email) {
    throw new AppError("validation", "Name and email are required", 422);
  }
  const user: RawBoUser = {
    id: nextId++,
    name: raw.name,
    email: raw.email,
    initials: raw.name.slice(0, 2).toUpperCase(),
    lastLogin: null,
    products: enrichAssignments(toAssignmentBody(raw.products)),
  };
  ensureSeeded().push(user);
  return user;
}

export function update(id: number, body: unknown): RawBoUser {
  const user = findById(id);
  if (!user) throw new AppError("not_found", "User not found", 404);
  const raw = (body ?? {}) as { name?: string; email?: string; products?: unknown };
  if (raw.name !== undefined) user.name = raw.name;
  if (raw.email !== undefined) user.email = raw.email;
  if (raw.products !== undefined) {
    user.products = enrichAssignments(toAssignmentBody(raw.products));
  }
  return user;
}

export function remove(id: number): void {
  const all = ensureSeeded();
  const index = all.findIndex((u) => Number(u.id) === id);
  if (index < 0) throw new AppError("not_found", "User not found", 404);
  all.splice(index, 1);
}
