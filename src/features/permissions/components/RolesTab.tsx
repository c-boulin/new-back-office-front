import { useState } from "react";
import { useMutation, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { RoleFormDialog } from "@/features/permissions/components/RoleFormDialog";
import { RolesSidebar } from "@/features/permissions/components/RolesSidebar";
import { RoleDetailPanel } from "@/features/permissions/components/RoleDetailPanel";
import { createRole, deleteRole, listRoles, updateRole } from "@/features/permissions/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { AppError } from "@/lib/httpClient";
import type { Role, RoleWriteBody } from "@/features/permissions/types";

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof AppError && error.message) return error.message;
  return fallback;
}

export type RolesTabProps = {
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
};

export function RolesTab({ createOpen, onCreateOpenChange }: RolesTabProps) {
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
  const [editing, setEditing] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["tenant", tenantId, "roles"] });

  const formOpen = createOpen || editing !== null;
  const closeForm = () => {
    setEditing(null);
    onCreateOpenChange(false);
  };

  const createMutation = useMutation({
    mutationFn: (body: RoleWriteBody) => createRole(body),
    onSuccess: () => {
      toast.success(t("toast.created"));
      closeForm();
      void invalidate();
    },
    onError: (error) => toast.error(errorMessage(error, t("toast.error"))),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: RoleWriteBody }) => updateRole(id, body),
    onSuccess: () => {
      toast.success(t("toast.updated"));
      closeForm();
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

  const pending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (body: RoleWriteBody) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, body });
    } else {
      createMutation.mutate(body);
    }
  };

  const selectedRole = roles.find((r) => r.id === selectedId) ?? null;

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        <RolesSidebar
          roles={roles}
          selectedId={selectedId}
          onSelect={(role) => setSelectedId(role.id)}
          onEdit={(role) => setEditing(role)}
          onDelete={(role) => setDeleteTarget(role)}
          onAdd={() => onCreateOpenChange(true)}
        />
        <RoleDetailPanel role={selectedRole} />
      </div>

      <RoleFormDialog
        open={formOpen}
        onOpenChange={(open) => !open && closeForm()}
        role={editing}
        pending={pending}
        onSubmit={handleSubmit}
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
