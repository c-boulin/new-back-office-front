import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PermissionMatrix } from "./PermissionMatrix";
import { buildPermissionMatrix } from "@/features/permissions/matrix";
import { ROLE_COLORS } from "@/features/permissions/types";
import type {
  PermissionMatrix as Matrix,
  Role,
  RoleColor,
  RoleWriteBody,
} from "@/features/permissions/types";

export type RoleFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  pending: boolean;
  onSubmit: (body: RoleWriteBody) => void;
};

export function RoleFormDialog({
  open,
  onOpenChange,
  role,
  pending,
  onSubmit,
}: RoleFormDialogProps) {
  const { t } = useTranslation("roles");
  const readOnly = role?.isLocked ?? false;

  const title = role
    ? readOnly
      ? t("form.viewTitle")
      : t("form.editTitle")
    : t("form.createTitle");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{t("form.description")}</DialogDescription>
        </DialogHeader>
        <RoleForm
          key={role?.id ?? "new"}
          role={role}
          readOnly={readOnly}
          pending={pending}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}

type RoleFormProps = {
  role: Role | null;
  readOnly: boolean;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (body: RoleWriteBody) => void;
};

function RoleForm({ role, readOnly, pending, onCancel, onSubmit }: RoleFormProps) {
  const { t } = useTranslation("roles");
  const [label, setLabel] = useState(role?.label ?? "");
  const [color, setColor] = useState<RoleColor>(role?.color ?? "primary");
  const [matrix, setMatrix] = useState<Matrix>(buildPermissionMatrix(role?.permissions));
  const [labelError, setLabelError] = useState(false);

  const toggle = (section: string, action: string, checked: boolean) => {
    setMatrix((prev) => ({
      ...prev,
      [section]: { ...prev[section], [action]: checked },
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) {
      setLabelError(true);
      return;
    }
    onSubmit({ label: trimmed, color, permissions: matrix });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="role-label">{t("form.labelField")}</Label>
          <Input
            id="role-label"
            value={label}
            disabled={readOnly}
            placeholder={t("form.labelPlaceholder")}
            onChange={(e) => {
              setLabel(e.target.value);
              if (labelError) setLabelError(false);
            }}
          />
          {labelError ? (
            <p className="text-sm text-destructive">{t("form.labelRequired")}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="role-color">{t("form.colorField")}</Label>
          <Select
            value={color}
            disabled={readOnly}
            onValueChange={(v) => setColor(v as RoleColor)}
          >
            <SelectTrigger id="role-color">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_COLORS.map((c) => (
                <SelectItem key={c} value={c}>
                  {t(`colors.${c}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("matrix.title")}</Label>
        <PermissionMatrix value={matrix} onToggle={toggle} readOnly={readOnly} />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          {readOnly ? t("actions.close") : t("actions.cancel")}
        </Button>
        {readOnly ? null : (
          <Button type="submit" disabled={pending}>
            {t("actions.save")}
          </Button>
        )}
      </DialogFooter>
    </form>
  );
}
