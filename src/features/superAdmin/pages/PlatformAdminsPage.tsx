import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Shield, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type PlatformAdmin = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin";
  addedAt: string;
};

const MOCK_ADMINS: PlatformAdmin[] = [
  { id: "adm_001", name: "Alice Admin", email: "alice@platform.io", role: "owner", addedAt: "2024-01-15T10:00:00Z" },
  { id: "adm_002", name: "Bob Moderator", email: "bob@platform.io", role: "admin", addedAt: "2024-06-20T14:00:00Z" },
  { id: "adm_003", name: "Charlie Ops", email: "charlie@platform.io", role: "admin", addedAt: "2025-01-10T09:00:00Z" },
];

export function PlatformAdminsPage() {
  const { t } = useTranslation("superAdmin");
  const [admins] = useState<PlatformAdmin[]>(MOCK_ADMINS);
  const [removeTarget, setRemoveTarget] = useState<PlatformAdmin | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("admins.title")}
        description={t("admins.description")}
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("admins.invite")}
          </Button>
        }
      />

      {admins.length === 0 ? (
        <EmptyState
          title="No platform admins"
          description="Invite administrators to manage the platform."
          icon={Shield}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {admins.map((admin) => (
            <Card key={admin.id}>
              <CardContent className="flex items-start justify-between p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <span className="text-sm font-medium">
                        {admin.name.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{admin.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{admin.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant={admin.role === "owner" ? "default" : "secondary"}>
                      {admin.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Added {new Date(admin.addedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {admin.role !== "owner" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => setRemoveTarget(admin)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={removeTarget !== null}
        onOpenChange={(open) => { if (!open) setRemoveTarget(null); }}
        title={`Remove ${removeTarget?.name}?`}
        description="This admin will lose all platform-level privileges immediately."
        destructive
        onConfirm={() => setRemoveTarget(null)}
      />
    </div>
  );
}
