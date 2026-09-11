import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { ModerationContentKind } from "@/features/moderation/types";

export type KindFilter = ModerationContentKind | "all";

const KINDS: KindFilter[] = ["all", "nickname", "profile_photo", "story"];

const KIND_LABEL_KEY: Record<KindFilter, string> = {
  all: "types.all",
  nickname: "types.nickname",
  profile_photo: "types.profilePhoto",
  story: "types.story",
  message: "types.message",
};

export function ModerationTypeTabs({
  value,
  onChange,
}: {
  value: KindFilter;
  onChange: (next: KindFilter) => void;
}) {
  const { t } = useTranslation("moderation");
  return (
    <div
      role="tablist"
      aria-label={t("filters.type")}
      className="flex items-center gap-1 rounded-full border bg-muted/40 p-1 text-sm"
    >
      {KINDS.map((kind) => {
        const active = value === kind;
        return (
          <button
            key={kind}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(kind)}
            className={cn(
              "rounded-full px-3.5 py-1.5 font-medium transition",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t(KIND_LABEL_KEY[kind])}
          </button>
        );
      })}
    </div>
  );
}
