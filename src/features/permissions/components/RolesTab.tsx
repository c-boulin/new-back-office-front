import { useState } from "react";
import { useMutation, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { RoleFormDialog } from "@/features/permissions/components/RoleFormDialog";
import { RolesSidebar } from "@/features/permissions/components/RolesSidebar";
import { RoleDetailPanel } from "@/features/permissions/components/RoleDetailPanel";
import { buildPermissionMatrix } from "@/features/permissions/matrix";
import { createRole, deleteRole, listRoles, updateRole } from "@/features/permissions/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { AppError } from "@/lib/httpClient";
import type { PermissionMatrix, Role, RoleWriteBody } from "@/features/permissions/types";

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof AppError && error.message) return error.message;
  return fallback;
}

export function RolesTab() {
  const { t } = useTranslation("roles");
  const { id: tenantId } = useActiveTenant();
  const queryClient = useQueryClient();

  const { data: roles } = useSuspenseQuery({
    queryKey: ["tenant", tenantId, "roles"],
    queryFn: listRoles,
  });

  const [selectedId, setSelectedId] = useState<string | null>(
    roles.length > 0 ? roles[0].id : null,
  );
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["tenant", tenantId, "roles"] });

  const createMutation = useMutation({
    mutationFn: (body: RoleWriteBody) => createRole(body),
    onSuccess: () => {
      toast.success(t("toast.created"));
      setCreateOpen(false);
      void invalidate();
    },
    onError: (error) => toast.error(errorMessage(error, t("toast.error"))),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: RoleWriteBody }) => updateRole(id, body),
    onSuccess: () => {
      toast.success(t("toast.updated"));
      void invalidate();
    },
    onError: (error) => toast.error(errorMessage(error, t("toast.error"))),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      setDeleteTarget(null);
      if (selectedId === deleteTarget?.id) {
        setSelectedId(roles.find((r) => r.id !== deleteTarget?.id)?.id ?? null);
      }
      void invalidate();
    },
    onError: (error) => toast.error(errorMessage(error, t("toast.error"))),
  });

  const selectedRole = roles.find((r) => r.id === selectedId) ?? null;

  const handleToggle = (section: string, action: string, value: boolean) => {
    if (!selectedRole || selectedRole.isLocked) return;
    const nextMatrix: PermissionMatrix = buildPermissionMatrix(selectedRole.permissions);
    nextMatrix[section] = { ...nextMatrix[section], [action]: value };
    updateMutation.mutate({
      id: selectedRole.id,
      body: { label: selectedRole.label, color: selectedRole.color, permissions: nextMatrix },
    });
  };

  const handleRename = (label: string) => {
    if (!selectedRole || selectedRole.isLocked) return;
    updateMutation.mutate({
      id: selectedRole.id,
      body: { label, color: selectedRole.color, permissions: selectedRole.permissions },
    });
  };

  const handleColorChange = (color: string) => {
    if (!selectedRole || selectedRole.isLocked) return;
    updateMutation.mutate({
      id: selectedRole.id,
      body: { label: selectedRole.label, color, permissions: selectedRole.permissions },
    });
  };

  return (
    <>
      <div className="grid grid-cols-[288px_1fr] items-start gap-0">
        <RolesSidebar
          roles={roles}
          selectedId={selectedId}
          onSelect={(role) => setSelectedId(role.id)}
          onDelete={(role) => setDeleteTarget(role)}
          onAdd={() => setCreateOpen(true)}
        />
        <div className="pl-8">
          <RoleDetailPanel
            role={selectedRole}
            onToggle={handleToggle}
            onRename={handleRename}
            onColorChange={handleColorChange}
          />
        </div>
      </div>

      <RoleFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        pending={createMutation.isPending}
        onSubmit={(body) => createMutation.mutate(body)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("delete.title")}
        description={t("delete.description", { label: deleteTarget?.label ?? "" })}
        confirmLabel={t("actions.delete")}
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </>
  );
}
