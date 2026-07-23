import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { PERMISSIONS, type PermissionMatrix } from "@/lib/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSION_SECTIONS } from "@/lib/permissions";
import {
  createRole,
  deleteRole,
  fetchRoles,
  updateRole,
  type RolePayload,
} from "../api";
import type { Role } from "../adaptors";
import { RolesList } from "./RolesList";
import { RoleEditor } from "./RoleEditor";
import { CreateRoleDialog } from "./CreateRoleDialog";
import type { RawRoleColor } from "../schemas";

const ROLES_QUERY_KEY = ["permissions", "roles"] as const;

function emptyMatrix(): PermissionMatrix {
  const out: PermissionMatrix = {};
  for (const section of PERMISSION_SECTIONS) out[section] = {};
  return out;
}

function pickNextSelection(roles: Role[], deletedId: string): string | null {
  const remaining = roles.filter((r) => r.id !== deletedId);
  return remaining[0]?.id ?? null;
}

export function RolesManager() {
  const { t } = useTranslation("permissions");
  const { t: tCommon } = useTranslation("common");
  const { can } = usePermissions();
  const queryClient = useQueryClient();

  const canRead = can(PERMISSIONS.SETTINGS_READ);
  const canCreate = can(PERMISSIONS.SETTINGS_CREATE);
  const canUpdate = can(PERMISSIONS.SETTINGS_UPDATE);
  const canDelete = can(PERMISSIONS.SETTINGS_DELETE);

  const { data: roles } = useSuspenseQuery({
    queryKey: ROLES_QUERY_KEY,
    queryFn: fetchRoles,
    staleTime: 30_000,
  });

  const [selectedId, setSelectedId] = useState<string | null>(roles[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (selectedId && roles.some((r) => r.id === selectedId)) return;
    setSelectedId(roles[0]?.id ?? null);
  }, [roles, selectedId]);

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedId) ?? null,
    [roles, selectedId],
  );

  const updateMut = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: RolePayload }) =>
      updateRole(id, payload),
    onSuccess: (next) => {
      queryClient.setQueryData<Role[]>(ROLES_QUERY_KEY, (current) =>
        current ? current.map((r) => (r.id === next.id ? next : r)) : current,
      );
      toast.success(t("toast.saved"));
    },
    onError: () => toast.error(t("toast.error")),
  });

  const createMut = useMutation({
    mutationFn: async (payload: RolePayload) => createRole(payload),
    onSuccess: (created) => {
      queryClient.setQueryData<Role[]>(ROLES_QUERY_KEY, (current) =>
        current ? [...current, created] : [created],
      );
      setSelectedId(created.id);
      setCreateOpen(false);
      toast.success(t("toast.created"));
    },
    onError: () => toast.error(t("toast.error")),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      await deleteRole(id);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<Role[]>(ROLES_QUERY_KEY, (current) =>
        current ? current.filter((r) => r.id !== deletedId) : current,
      );
      setSelectedId((current) => (current === deletedId ? pickNextSelection(roles, deletedId) : current));
      toast.success(t("toast.deleted"));
    },
    onError: () => toast.error(t("toast.error")),
  });

  if (!canRead) {
    return (
      <div className="p-6 text-sm text-muted-foreground">{tCommon("errors.description")}</div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("pageTitle")} description={t("pageDescription")} />

      <div className="grid min-h-[calc(100vh-14rem)] gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className="rounded-xl border bg-card p-4 lg:sticky lg:top-4 lg:h-fit lg:max-h-[calc(100vh-6rem)]">
          <RolesList
            roles={roles}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onCreate={() => setCreateOpen(true)}
            canCreate={canCreate}
            search={search}
            onSearchChange={setSearch}
          />
        </aside>

        <section className="rounded-xl border bg-card p-6">
          <RoleEditor
            role={selectedRole}
            canUpdate={canUpdate}
            canDelete={canDelete}
            isSaving={updateMut.isPending}
            isDeleting={deleteMut.isPending}
            onSave={async ({ id, label, color, matrix }) => {
              await updateMut.mutateAsync({ id, payload: { label, color, matrix } });
            }}
            onDelete={async (id) => {
              await deleteMut.mutateAsync(id);
            }}
          />
        </section>
      </div>

      <CreateRoleDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        loading={createMut.isPending}
        onSubmit={async ({ label, color }: { label: string; color: RawRoleColor }) => {
          await createMut.mutateAsync({ label, color, matrix: emptyMatrix() });
        }}
      />
    </div>
  );
}
