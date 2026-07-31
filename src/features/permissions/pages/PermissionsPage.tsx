import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { PermissionGate } from "@/components/common/PermissionGate";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RolesTab } from "@/features/permissions/components/RolesTab";
import { BoUsersTab } from "@/features/boUsers/components/BoUsersTab";
import { useUrlState, urlEnum } from "@/hooks/useUrlState";
import { PERMISSIONS } from "@/lib/permissions";

const TABS = ["users", "roles"] as const;
type TabId = (typeof TABS)[number];

const tabSpec = {
  tab: urlEnum<TabId>(TABS, "users"),
};

export function PermissionsPage() {
  const { t } = useTranslation("boUsers");
  const { t: tRoles } = useTranslation("roles");
  const [state, setState] = useUrlState(tabSpec);

  const [rolesCreateOpen, setRolesCreateOpen] = useState(false);
  const [usersCreateOpen, setUsersCreateOpen] = useState(false);

  const cta =
    state.tab === "roles" ? null : (
      <PermissionGate require={PERMISSIONS.USERS_UPDATE}>
        <Button
          onClick={() => {
            setUsersCreateOpen(true);
          }}
        >
          <Plus />
          {t("actions.create")}
        </Button>
      </PermissionGate>
    );

  return (
    <div className="space-y-6">
      <PageHeader title={t("page.title")} description={t("page.description")} actions={cta} />

      <Tabs value={state.tab} onValueChange={(value) => setState({ tab: value as TabId })}>
        <TabsList>
          <TabsTrigger value="users">{t("tabs.users")}</TabsTrigger>
          <TabsTrigger value="roles">{tRoles("tabs.roles")}</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <BoUsersTab createOpen={usersCreateOpen} onCreateOpenChange={setUsersCreateOpen} />
        </TabsContent>

        <TabsContent value="roles">
          <RolesTab createOpen={rolesCreateOpen} onCreateOpenChange={setRolesCreateOpen} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
