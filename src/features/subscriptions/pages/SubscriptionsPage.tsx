import { Sparkles } from "lucide-react";
import { PlaceholderPage } from "@/components/common/PlaceholderPage";

export function SubscriptionsPage() {
  return (
    <PlaceholderPage
      title="Subscriptions"
      description="Track plans, revenue, refunds, and trial funnels."
      emptyTitle="No subscription data"
      emptyDescription="Subscription analytics and management will appear here."
      icon={Sparkles}
    />
  );
}
