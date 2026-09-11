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

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  typedConfirmationValue?: string;
  loading?: boolean;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive,
  typedConfirmationValue,
  loading,
  onConfirm,
}: ConfirmDialogProps) {
  const { t } = useTranslation("common");
  const [typed, setTyped] = useState("");
  const requiresTyping = Boolean(typedConfirmationValue);
  const canConfirm = !requiresTyping || typed === typedConfirmationValue;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setTyped("");
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {requiresTyping ? (
          <div className="space-y-2">
            <Label htmlFor="confirm-typing">
              {t("confirm.typePrompt", { value: typedConfirmationValue })}
            </Label>
            <Input
              id="confirm-typing"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
            />
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel ?? t("actions.cancel")}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={!canConfirm || loading}
          >
            {confirmLabel ?? t("actions.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
