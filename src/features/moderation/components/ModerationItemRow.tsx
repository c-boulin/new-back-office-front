import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { AlertCircle, Camera, Image as ImageIcon, MessageSquare, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizeText } from "@/lib/sanitize";
import type {
  ModerationContentKind,
  ModerationItem,
} from "@/features/moderation/types";

const KIND_ICON: Record<ModerationContentKind, LucideIcon> = {
  nickname: User,
  profile_photo: Camera,
  story: ImageIcon,
  message: MessageSquare,
};

export function ModerationItemRow({
  item,
  active,
  onSelect,
}: {
  item: ModerationItem;
  active: boolean;
  onSelect: (item: ModerationItem) => void;
}) {
  const { t } = useTranslation("moderation");
  const Icon = KIND_ICON[item.contentKind] ?? AlertCircle;
  const kindLabelKey =
    item.contentKind === "nickname"
      ? "types.nickname"
      : item.contentKind === "profile_photo"
        ? "types.profilePhoto"
        : item.contentKind === "story"
          ? "types.story"
          : "types.message";
  const preview = item.contentPreview ?? item.reason;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition",
        active
          ? "border-primary/40 bg-primary/5"
          : "hover:border-border hover:bg-muted/40",
      )}
    >
      <span className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {sanitizeText(item.subjectName)}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {format(new Date(item.createdAt), "d MMM")}
          </span>
        </span>
        <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
            {t(kindLabelKey)}
          </span>
          <span className="truncate">{preview}</span>
        </span>
      </span>
    </button>
  );
}
