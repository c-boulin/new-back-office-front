import { Heart } from "lucide-react";
import { PlaceholderPage } from "@/components/common/PlaceholderPage";

export function MatchesPage() {
  return (
    <PlaceholderPage
      title="Matches"
      description="Insights into match rates, quality, and distribution."
      emptyTitle="No data yet"
      emptyDescription="Match analytics will populate as your users interact."
      icon={Heart}
    />
  );
}
