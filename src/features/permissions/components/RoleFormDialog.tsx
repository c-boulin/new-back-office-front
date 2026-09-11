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
import { PermissionPillMatrix } from "./PermissionPillMatrix";
import { ColorPicker } from "./ColorPicker";
import { buildPermissionMatrix } from "@/features/permissions/matrix";
import { DEFAULT_ROLE_COLOR } from "@/features/permissions/types";
import type { PermissionMatrix as Matrix, RoleWriteBody } from "@/features/permissions/types";

export type RoleFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending: boolean;
  onSubmit: (body: RoleWriteBody) => void;
};

export function RoleFormDialog({
  open,
  onOpenChange,
  pending,
  onSubmit,
}: RoleFormDialogProps) {
  const { t } = useTranslation("roles");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("form.createTitle")}</DialogTitle>
          <DialogDescription>{t("form.description")}</DialogDescription>
        </DialogHeader>
        <CreateRoleForm
          key={open ? "open" : "closed"}
          pending={pending}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}

type CreateRoleFormProps = {
  pending: boolean;
  onCancel: () => void;
  onSubmit: (body: RoleWriteBody) => void;
};

function CreateRoleForm({ pending, onCancel, onSubmit }: CreateRoleFormProps) {
  const { t } = useTranslation("roles");
  const [label, setLabel] = useState("");
  const [color, setColor] = useState(DEFAULT_ROLE_COLOR);
  const [matrix, setMatrix] = useState<Matrix>(buildPermissionMatrix());
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
          <Label>{t("form.colorField")}</Label>
          <ColorPicker value={color} onChange={setColor} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("matrix.title")}</Label>
        <PermissionPillMatrix value={matrix} onToggle={toggle} readOnly={false} />
      </div>

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
