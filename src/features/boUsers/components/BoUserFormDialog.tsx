import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingState } from "@/components/common/LoadingState";
import { fetchProducts } from "@/features/auth/api";
import { listRoles } from "@/features/permissions/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import type { BoUser, BoUserWriteBody } from "@/features/boUsers/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AssignmentRow = {
  key: string;
  productId: number | null;
  roleId: string | null;
};

export type BoUserFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: BoUser | null;
  pending: boolean;
  onSubmit: (body: BoUserWriteBody) => void;
};

export function BoUserFormDialog({
  open,
  onOpenChange,
  user,
  pending,
  onSubmit,
}: BoUserFormDialogProps) {
  const { t } = useTranslation("boUsers");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? t("form.editTitle") : t("form.createTitle")}</DialogTitle>
          <DialogDescription>{t("form.description")}</DialogDescription>
        </DialogHeader>
        {open ? (
          <BoUserForm
            key={user?.id ?? "new"}
            user={user}
            pending={pending}
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

type BoUserFormProps = {
  user: BoUser | null;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (body: BoUserWriteBody) => void;
};

function newRow(productId: number | null = null, roleId: string | null = null): AssignmentRow {
  return { key: crypto.randomUUID(), productId, roleId };
}

function BoUserForm({ user, pending, onCancel, onSubmit }: BoUserFormProps) {
  const { t } = useTranslation("boUsers");
  const { id: tenantId } = useActiveTenant();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [rows, setRows] = useState<AssignmentRow[]>(
    user && user.products.length > 0
      ? user.products.map((p) => newRow(p.id, p.role.id))
      : [newRow()],
  );
  const [error, setError] = useState<string | null>(null);

  const productsQuery = useQuery({
    queryKey: ["products", "catalog"],
    queryFn: fetchProducts,
  });
  const rolesQuery = useQuery({
    queryKey: ["tenant", tenantId, "roles"],
    queryFn: listRoles,
  });

  const products = productsQuery.data ?? [];
  const roles = rolesQuery.data ?? [];

  const updateRow = (key: string, patch: Partial<AssignmentRow>) => {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
    if (error) setError(null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName) return setError(t("form.nameRequired"));
    if (!EMAIL_RE.test(trimmedEmail)) return setError(t("form.emailInvalid"));

    const filled = rows.filter((row) => row.productId !== null && row.roleId !== null);
    if (filled.length === 0) return setError(t("form.assignmentRequired"));

    const productIds = filled.map((row) => row.productId);
    if (new Set(productIds).size !== productIds.length) {
      return setError(t("form.duplicateProduct"));
    }

    onSubmit({
      name: trimmedName,
      email: trimmedEmail,
      products: filled.map((row) => ({ id: row.productId as number, roleId: row.roleId as string })),
    });
  };

  if (productsQuery.isLoading || rolesQuery.isLoading) {
    return <LoadingState />;
  }

  if (productsQuery.isError || rolesQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{t("form.loadError")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="bo-user-name">{t("form.nameField")}</Label>
          <Input
            id="bo-user-name"
            value={name}
            placeholder={t("form.namePlaceholder")}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bo-user-email">{t("form.emailField")}</Label>
          <Input
            id="bo-user-email"
            type="email"
            value={email}
            placeholder={t("form.emailPlaceholder")}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>{t("form.assignments")}</Label>
        <div className="space-y-2">
          {rows.map((row) => {
            const takenProductIds = rows
              .filter((other) => other.key !== row.key && other.productId !== null)
              .map((other) => other.productId);
            return (
              <div key={row.key} className="flex items-start gap-2">
                <Select
                  value={row.productId !== null ? String(row.productId) : undefined}
                  onValueChange={(v) => updateRow(row.key, { productId: Number(v) })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={t("form.selectProduct")} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem
                        key={product.id}
                        value={String(product.id)}
                        disabled={takenProductIds.includes(product.id)}
                      >
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={row.roleId ?? undefined}
                  onValueChange={(v) => updateRow(row.key, { roleId: v })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={t("form.selectRole")} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id} disabled={role.isLocked}>
                        {role.label}
                        {role.isLocked ? ` (${t("form.lockedRole")})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={t("actions.removeAssignment")}
                  disabled={rows.length === 1}
                  onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                >
                  <X />
                </Button>
              </div>
            );
          })}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setRows((prev) => [...prev, newRow()])}
        >
          <Plus />
          {t("actions.addAssignment")}
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          {t("actions.cancel")}
        </Button>
        <Button type="submit" disabled={pending}>
          {t("actions.save")}
        </Button>
      </DialogFooter>
    </form>
  );
}
