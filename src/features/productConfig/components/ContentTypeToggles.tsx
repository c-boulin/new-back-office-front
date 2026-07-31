import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { DefaultContentTypes } from "@/features/productConfig/types";

export type ContentTypeTogglesProps = {
  value: DefaultContentTypes;
  onChange: (value: DefaultContentTypes) => void;
};

const KEYS = ["photo", "story", "event", "externalLink", "video"] as const;

export function ContentTypeToggles({ value, onChange }: ContentTypeTogglesProps) {
  const { t } = useTranslation("productConfig");
  return (
    <div className="flex flex-wrap gap-2">
      {KEYS.map((key) => {
        const active = value[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange({ ...value, [key]: !active })}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-accent",
            )}
          >
            {t(`contentTypes.${key}`)}
          </button>
        );
      })}
    </div>
  );
}
