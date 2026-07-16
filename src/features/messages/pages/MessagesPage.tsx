import { MessagesSquare } from "lucide-react";
import { PlaceholderPage } from "@/components/common/PlaceholderPage";

export function MessagesPage() {
  return (
    <PlaceholderPage
      title="Messages"
      description="Monitor flagged conversations and safety signals across chats."
      emptyTitle="Nothing to moderate"
      emptyDescription="Flagged messages will appear here as safety systems detect them."
      icon={MessagesSquare}
    />
  );
}
