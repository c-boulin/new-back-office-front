import { useTranslation } from "react-i18next";
import { Link } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfigCard } from "./ConfigCard";
import type { LegalLinks } from "@/features/productConfig/types";

export type LegalLinksCardProps = {
  value: LegalLinks;
  onChange: (value: LegalLinks) => void;
};

const FIELDS = [
  "termsUrl",
  "privacyUrl",
  "cookiesUrl",
  "legalNoticeUrl",
  "refundPolicyUrl",
  "communityGuidelinesUrl",
  "safetyTipsUrl",
  "antiHarassmentPolicyUrl",
  "dataProcessingUrl",
  "ageRatingUrl",
  "contactUrl",
] as const;

export function LegalLinksCard({ value, onChange }: LegalLinksCardProps) {
  const { t } = useTranslation("productConfig");
  return (
    <ConfigCard
      title={t("cards.legalLinks.title")}
      subtitle={t("cards.legalLinks.subtitle")}
      className="h-fit"
    >
      <div className="space-y-3">
        {FIELDS.map((key) => (
          <div key={key} className="space-y-1.5">
            <Label htmlFor={`legal-${key}`} className="text-sm">
              {t(`legalLinks.${key}`)}
            </Label>
            <div className="relative">
              <Link className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id={`legal-${key}`}
                type="url"
                placeholder="https://..."
                value={value[key]}
                onChange={(e) => onChange({ ...value, [key]: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>
        ))}
      </div>
    </ConfigCard>
  );
}
