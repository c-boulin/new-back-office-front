import { useState, type Dispatch, type SetStateAction } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { PaginationState } from "@tanstack/react-table";
import { RouteBoundary } from "@/components/common/RouteBoundary";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { BoUsersTable } from "@/features/boUsers/components/BoUsersTable";
import { BoUserFormDialog } from "@/features/boUsers/components/BoUserFormDialog";
import { createBoUser, deleteBoUser, updateBoUser } from "@/features/boUsers/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { usePermissions } from "@/hooks/usePermissions";
import { useUrlState, urlInt } from "@/hooks/useUrlState";
import { AppError } from "@/lib/httpClient";
import { PERMISSIONS } from "@/lib/permissions";
import type { BoUser, BoUserWriteBody } from "@/features/boUsers/types";

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof AppError && error.message) return error.message;
  return fallback;
}

const paginationSpec = {
  page: urlInt(0, 0),
  size: urlInt(15, 1),
};

export type BoUsersTabProps = {
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
};

export function BoUsersTab({ createOpen, onCreateOpenChange }: BoUsersTabProps) {
  const { t } = useTranslation("boUsers");
  const { id: tenantId } = useActiveTenant();
  const { can } = usePermissions();
  const queryClient = useQueryClient();

  const [state, setState] = useUrlState(paginationSpec);
  const [editing, setEditing] = useState<BoUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BoUser | null>(null);

  const canUpdate = can(PERMISSIONS.USERS_UPDATE);
  const canDelete = can(PERMISSIONS.USERS_DELETE);

  const pagination: PaginationState = { pageIndex: state.page, pageSize: state.size };
  const setPagination: Dispatch<SetStateAction<PaginationState>> = (updater) => {
    const next = typeof updater === "function" ? updater(pagination) : updater;
    setState({ page: next.pageIndex, size: next.pageSize });
  };

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["tenant", tenantId, "bo-users"] });

  const formOpen = createOpen || editing !== null;
  const closeForm = () => {
    setEditing(null);
    onCreateOpenChange(false);
  };

  const createMutation = useMutation({
    mutationFn: (body: BoUserWriteBody) => createBoUser(body),
    onSuccess: () => {
      toast.success(t("toast.created"));
      closeForm();
      void invalidate();
    },
    onError: (error) => toast.error(errorMessage(error, t("toast.error"))),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: BoUserWriteBody }) => updateBoUser(id, body),
    onSuccess: () => {
      toast.success(t("toast.updated"));
      closeForm();
      void invalidate();
    },
    onError: (error) => toast.error(errorMessage(error, t("toast.error"))),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteBoUser(id),
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      setDeleteTarget(null);
      void invalidate();
    },
    onError: (error) => toast.error(errorMessage(error, t("toast.error"))),
  });

  const pending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (body: BoUserWriteBody) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, body });
    } else {
      createMutation.mutate(body);
    }
  };

  return (
    <div className="space-y-4">
      <RouteBoundary>
        <BoUsersTable
          pagination={pagination}
          onPaginationChange={setPagination}
          onEdit={(user) => setEditing(user)}
          onDelete={(user) => setDeleteTarget(user)}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      </RouteBoundary>

      <BoUserFormDialog
        open={formOpen}
        onOpenChange={(open) => !open && closeForm()}
        user={editing}
        pending={pending}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("delete.title")}
        description={t("delete.description", { name: deleteTarget?.name ?? "" })}
        confirmLabel={t("actions.delete")}
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </div>
  );
}
