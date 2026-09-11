import { useState, useRef, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { Check, Lock, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EmptyState } from "@/components/common/EmptyState";
import { PermissionPillMatrix } from "./PermissionPillMatrix";
import { ColorPicker } from "./ColorPicker";
import type { Role } from "@/features/permissions/types";

function contrastText(hex: string): string {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#000000" : "#ffffff";
}

function countGranted(role: Role): number {
  return Object.values(role.permissions).reduce(
    (sum, actions) => sum + Object.values(actions).filter(Boolean).length,
    0,
  );
}

export type RoleDetailPanelProps = {
  role: Role | null;
  onToggle?: (section: string, action: string, value: boolean) => void;
  onRename?: (label: string) => void;
  onColorChange?: (color: string) => void;
};

export function RoleDetailPanel({ role, onToggle, onRename, onColorChange }: RoleDetailPanelProps) {
  const { t } = useTranslation("roles");

  if (!role) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <EmptyState title={t("noRoleSelected")} description={t("noRoleSelectedDesc")} />
      </div>
    );
  }

  const granted = countGranted(role);
  const total = Object.values(role.permissions).reduce(
    (sum, actions) => sum + Object.keys(actions).length,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase"
            style={{ backgroundColor: role.color, color: contrastText(role.color) }}
          >
            {role.label.slice(0, 2)}
          </span>
          <InlineRoleName
            label={role.label}
            isLocked={role.isLocked}
            onRename={onRename}
          />
          <ColorPickerBadge
            color={role.color}
            isLocked={role.isLocked}
            onColorChange={onColorChange}
          />
          {role.isLocked ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              <Lock className="h-3 w-3" aria-hidden />
              {t("nonModifiable")}
            </span>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          {t("permissionsGranted", { count: granted, total })}
        </p>
      </div>

      <PermissionPillMatrix
        value={role.permissions}
        onToggle={onToggle}
        readOnly={role.isLocked}
      />
    </div>
  );
}

type InlineRoleNameProps = {
  label: string;
  isLocked: boolean;
  onRename?: (label: string) => void;
};

function InlineRoleName({ label, isLocked, onRename }: InlineRoleNameProps) {
  const { t } = useTranslation("roles");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = () => {
    setDraft(label);
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.select());
  };

  const confirm = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== label) {
      onRename?.(trimmed);
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(label);
    setEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      confirm();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <Input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={confirm}
          className="h-9 w-48 text-lg font-bold"
          aria-label={t("form.labelField")}
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-emerald-600 hover:text-emerald-700"
          onClick={confirm}
          aria-label={t("actions.save")}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onMouseDown={(e) => e.preventDefault()}
          onClick={cancel}
          aria-label={t("actions.cancel")}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <h2 className="text-2xl font-bold">{label}</h2>
      {!isLocked ? (
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={startEditing}
          aria-label={t("actions.rename")}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      ) : null}
    </div>
  );
}

type ColorPickerBadgeProps = {
  color: string;
  isLocked: boolean;
  onColorChange?: (color: string) => void;
};

function ColorPickerBadge({ color, isLocked, onColorChange }: ColorPickerBadgeProps) {
  const { t } = useTranslation("roles");
  const [open, setOpen] = useState(false);

  if (isLocked) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-semibold"
        style={{ borderColor: color, color }}
      >
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
        {color}
      </span>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild aria-label={t("actions.pickColor")}>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-opacity hover:opacity-80"
          style={{ borderColor: color, color }}
        >
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
          {color}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <p className="mb-2 text-xs font-medium text-muted-foreground">{t("actions.pickColor")}</p>
        <ColorPicker
          value={color}
          onChange={(hex) => onColorChange?.(hex)}
        />
      </PopoverContent>
    </Popover>
  );
}
