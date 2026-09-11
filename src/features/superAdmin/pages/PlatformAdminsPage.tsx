import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterRow } from "@/components/common/FilterRow";
import { RouteBoundary } from "@/components/common/RouteBoundary";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlatformAdminsList } from "@/features/superAdmin/components/PlatformAdminsList";
import { useUrlState, urlEnum } from "@/hooks/useUrlState";
import type { PlatformAdminRole } from "@/features/superAdmin/types";

const ROLES = ["all", "owner", "admin", "read_only"] as const;
type RoleFilter = (typeof ROLES)[number];

const spec = {
  role: urlEnum<RoleFilter>(ROLES, "all"),
};

export function PlatformAdminsPage() {
  const { t } = useTranslation("superAdmin");
  const [state, setState] = useUrlState(spec);

  return (
    <div className="space-y-6">
      <PageHeader title={t("admins.title")} description={t("admins.description")} />

      <FilterRow onReset={() => setState({ role: "all" })}>
        <Select value={state.role} onValueChange={(v) => setState({ role: v as RoleFilter })}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={t("admins.filters.role")} />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {r === "all" ? t("admins.filters.all") : t(`admins.roles.${r}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterRow>

      <RouteBoundary>
        <PlatformAdminsList role={state.role as PlatformAdminRole | "all"} />
      </RouteBoundary>
    </div>
  );
}
