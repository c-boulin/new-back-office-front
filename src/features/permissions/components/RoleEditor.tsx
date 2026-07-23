import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Lock, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShieldCheck } from "lucide-react";
import type {
  PermissionAction,
  PermissionMatrix,
  PermissionSection,
} from "@/lib/permissions";
import { PERMISSION_MATRIX, PERMISSION_SECTIONS, PERMISSION_TOTAL } from "@/lib/permissions";
import { ROLE_COLORS, type Role } from "../adaptors";
import { PermissionMatrixEditor } from "./PermissionMatrixEditor";
import { RoleColorSwatch } from "./roleColor";
import type { RawRoleColor } from "../schemas";

export type RoleEditorProps = {
  role: Role | null;
  onSave: (patch: {
    id: string;
    label: string;
    color: RawRoleColor;
    matrix: PermissionMatrix;
  }) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  canUpdate: boolean;
  canDelete: boolean;
  isSaving: boolean;
  isDeleting: boolean;
};

function grantAll(): PermissionMatrix {
  const out: PermissionMatrix = {};
  for (const section of PERMISSION_SECTIONS) {
    const actions: Partial<Record<PermissionAction, boolean>> = {};
    for (const action of PERMISSION_MATRIX[section]) actions[action] = true;
    out[section] = actions;
  }
  return out;
}

function emptyMatrix(): PermissionMatrix {
  const out: PermissionMatrix = {};
  for (const section of PERMISSION_SECTIONS) out[section] = {};
  return out;
}

function countMatrix(matrix: PermissionMatrix): number {
  let total = 0;
  for (const section of PERMISSION_SECTIONS) {
    const actions = matrix[section];
    if (!actions) continue;
    for (const action of PERMISSION_MATRIX[section]) {
      if (actions[action]) total += 1;
    }
  }
  return total;
}

function matrixEquals(a: PermissionMatrix, b: PermissionMatrix): boolean {
  for (const section of PERMISSION_SECTIONS) {
    for (const action of PERMISSION_MATRIX[section]) {
      const va = Boolean(a[section]?.[action]);
      const vb = Boolean(b[section]?.[action]);
      if (va !== vb) return false;
    }
  }
  return true;
}

export function RoleEditor({
  role,
  onSave,
  onDelete,
  canUpdate,
  canDelete,
  isSaving,
  isDeleting,
}: RoleEditorProps) {
  const { t } = useTranslation("permissions");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [label, setLabel] = useState(role?.label ?? "");
  const [color, setColor] = useState<RawRoleColor>(role?.color ?? "primary");
  const [matrix, setMatrix] = useState<PermissionMatrix>(role?.matrix ?? emptyMatrix());
  const [lastRoleId, setLastRoleId] = useState<string | null>(role?.id ?? null);

  if (role?.id !== lastRoleId) {
    setLastRoleId(role?.id ?? null);
    setLabel(role?.label ?? "");
    setColor(role?.color ?? "primary");
    setMatrix(role?.matrix ?? emptyMatrix());
  }

  const grantedCount = useMemo(() => countMatrix(matrix), [matrix]);

  if (!role) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title={t("editor.title")}
        description={t("editor.pickRole")}
      />
    );
  }

  const disabled = role.isLocked || !canUpdate;
  const isDirty =
    !disabled &&
    (label.trim() !== role.label ||
      color !== (role.color ?? "primary") ||
      !matrixEquals(matrix, role.matrix));

  const toggle = (
    section: PermissionSection,
    action: PermissionAction,
    next: boolean,
  ) => {
    setMatrix((current) => ({
      ...current,
      [section]: { ...(current[section] ?? {}), [action]: next },
    }));
  };

  const handleSave = () => {
    void onSave({ id: role.id, label: label.trim(), color, matrix });
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="space-y-4 border-b pb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RoleColorSwatch color={color} className="h-2 w-2" />
              <span>{t("editor.title")}</span>
              {role.isLocked ? (
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium">
                  <Lock className="h-3 w-3" aria-hidden />
                  {t("list.locked")}
                </span>
              ) : null}
            </div>
            <h2 className="truncate text-xl font-semibold tracking-tight">
              {label || role.label}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("list.counterLabel", { granted: grantedCount, total: PERMISSION_TOTAL })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isDirty ? (
              <Badge variant="outline" className="gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-warning" aria-hidden />
                {t("editor.unsaved")}
              </Badge>
            ) : null}
            {canDelete && !role.isLocked ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                className="gap-1.5 text-destructive hover:text-destructive"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                {t("actions.delete")}
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              disabled={disabled || !isDirty || isSaving || label.trim().length === 0}
              onClick={handleSave}
              className="gap-1.5"
            >
              <Save className="h-4 w-4" aria-hidden />
              {t("actions.save")}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
          <div className="space-y-1.5">
            <Label htmlFor="role-label">{t("editor.roleName")}</Label>
            <Input
              id="role-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={disabled}
              maxLength={64}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role-color">{t("editor.roleColor")}</Label>
            <Select
              value={color}
              onValueChange={(value) => setColor(value as RawRoleColor)}
              disabled={disabled}
            >
              <SelectTrigger id="role-color">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_COLORS.map((c) => (
                  <SelectItem key={c} value={c}>
                    <span className="flex items-center gap-2">
                      <RoleColorSwatch color={c} />
                      {t(`colors.${c}`)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {role.isLocked ? (
          <p className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            {t("editor.lockedNotice")}
          </p>
        ) : null}

        {!disabled ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMatrix(grantAll())}
              disabled={disabled}
            >
              {t("editor.grantAll")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMatrix(emptyMatrix())}
              disabled={disabled}
            >
              {t("editor.grantNone")}
            </Button>
          </div>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <PermissionMatrixEditor
          matrix={matrix}
          disabled={disabled}
          onToggle={toggle}
        />
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={t("editor.confirmDeleteTitle", { label: role.label })}
        description={t("editor.confirmDeleteDescription")}
        confirmLabel={t("actions.delete")}
        destructive
        onOpenChange={setConfirmDelete}
        onConfirm={async () => {
          await onDelete(role.id);
          setConfirmDelete(false);
        }}
      />
    </div>
  );
}
