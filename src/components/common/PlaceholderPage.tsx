import type { ReactNode } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import type { LucideIcon } from "lucide-react";

export function PlaceholderPage({
  title,
  description,
  emptyTitle,
  emptyDescription,
  icon,
  actions,
}: {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  icon?: LucideIcon;
  actions?: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} actions={actions} />
      <EmptyState title={emptyTitle} description={emptyDescription} icon={icon} />
    </div>
  );
}
