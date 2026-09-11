import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings2, RotateCcw, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

export type ProductConfigHeaderProps = {
  isDirty: boolean;
  isSaving: boolean;
  isResetting: boolean;
  onDiscard: () => void;
  onSave: () => void;
  onResetToDefault: () => void;
  canUpdate: boolean;
  canDelete: boolean;
};

export function ProductConfigHeader({
  isDirty,
  isSaving,
  isResetting,
  onDiscard,
  onSave,
  onResetToDefault,
  canUpdate,
  canDelete,
}: ProductConfigHeaderProps) {
  const { t } = useTranslation("productConfig");
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Settings2 className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {canUpdate && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDiscard}
              disabled={!isDirty || isSaving}
            >
              <RotateCcw className="h-4 w-4" />
              {t("summary.reset")}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onSave}
              disabled={!isDirty || isSaving}
            >
              <Save className="h-4 w-4" />
              {t("summary.save")}
            </Button>
          </>
        )}
        {canDelete && (
          <>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setConfirmOpen(true)}
              disabled={isResetting}
            >
              <Trash2 className="h-4 w-4" />
              {t("summary.resetToDefault")}
            </Button>
            <ConfirmDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title={t("summary.resetToDefault")}
              description={t("summary.resetToDefaultDescription")}
              destructive
              loading={isResetting}
              onConfirm={onResetToDefault}
            />
          </>
        )}
      </div>
    </div>
  );
}
