import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { RouteBoundary } from "@/components/common/RouteBoundary";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { RolesTable } from "@/features/permissions/components/RolesTable";
import { RoleFormDialog } from "@/features/permissions/components/RoleFormDialog";
import { createRole, deleteRole, updateRole } from "@/features/permissions/api";
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

  return (
    <div className="space-y-4">
      <RouteBoundary>
        <RolesTable
          onOpen={(role) => setEditing(role)}
          onDelete={(role) => setDeleteTarget(role)}
        />
      </RouteBoundary>

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
    </div>
  );
}
