import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { ContentType } from "@/features/productConfig/types";

export type ContentTypeTogglesProps = {
  value: ContentType[];
  onChange: (value: ContentType[]) => void;
  disabled?: boolean;
};

const ALL_TYPES: ContentType[] = ["photo", "story", "event", "externallink"];

export function ContentTypeToggles({ value, onChange, disabled }: ContentTypeTogglesProps) {
  const { t } = useTranslation("productConfig");

  function toggle(type: ContentType) {
    if (disabled) return;
    if (value.includes(type)) {
      onChange(value.filter((v) => v !== type));
    } else {
      onChange([...value, type]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ALL_TYPES.map((type) => {
        const active = value.includes(type);
        return (
          <button
            key={type}
            type="button"
            onClick={() => toggle(type)}
            disabled={disabled}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-accent",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            {t(`contentTypes.${type}`)}
          </button>
        );
      })}
    </div>
  );
}
