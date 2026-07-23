import { useState } from "react";
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
import { ROLE_COLORS } from "../adaptors";
import { RoleColorSwatch } from "./roleColor";
import type { RawRoleColor } from "../schemas";

export type CreateRoleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { label: string; color: RawRoleColor }) => Promise<void> | void;
  loading?: boolean;
};

export function CreateRoleDialog({
  open,
  onOpenChange,
  onSubmit,
  loading,
}: CreateRoleDialogProps) {
  const { t } = useTranslation("permissions");
  const [label, setLabel] = useState("");
  const [color, setColor] = useState<RawRoleColor>("primary");

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setLabel("");
      setColor("primary");
    }
    onOpenChange(next);
  };

  const disabled = loading || label.trim().length === 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("actions.newRole")}</DialogTitle>
          <DialogDescription>{t("pageDescription")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-role-label">{t("editor.roleName")}</Label>
            <Input
              id="new-role-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={64}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-role-color">{t("editor.roleColor")}</Label>
            <Select value={color} onValueChange={(v) => setColor(v as RawRoleColor)}>
              <SelectTrigger id="new-role-color">
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
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            {t("actions.cancel")}
          </Button>
          <Button
            onClick={() => void onSubmit({ label: label.trim(), color })}
            disabled={disabled}
          >
            {t("actions.createRole")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
