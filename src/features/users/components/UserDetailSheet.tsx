import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { CircleCheck as CheckCircle2, ShieldOff, Undo2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PermissionGate } from "@/components/common/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import { banUser, unbanUser, verifyUser } from "@/features/users/api";
import { toast } from "@/components/ui/sonner";
import type { UserRecord } from "@/features/users/types";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UserDetailSheet({
  user,
  open,
  onOpenChange,
}: {
  user: UserRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation("users");
  const qc = useQueryClient();
  const [banOpen, setBanOpen] = useState(false);

  const verifyMutation = useMutation({
    mutationFn: (id: string) => verifyUser(id),
    onSuccess: () => {
      toast.success("User verified");
      void qc.invalidateQueries({ queryKey: ["tenant"] });
    },
  });

  const banMutation = useMutation({
    mutationFn: (id: string) => banUser(id, "Admin action"),
    onSuccess: () => {
      toast.success("User banned");
      setBanOpen(false);
      onOpenChange(false);
      void qc.invalidateQueries({ queryKey: ["tenant"] });
    },
  });

  const unbanMutation = useMutation({
    mutationFn: (id: string) => unbanUser(id),
    onSuccess: () => {
      toast.success("User unbanned");
      void qc.invalidateQueries({ queryKey: ["tenant"] });
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        {user ? (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
                  <AvatarFallback>{initials(user.displayName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <SheetTitle className="truncate">{user.displayName}</SheetTitle>
                  <SheetDescription className="truncate">{user.email}</SheetDescription>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary" className="capitalize">
                  {user.status.replace("_", " ")}
                </Badge>
                {user.isVerified ? <Badge variant="success">Verified</Badge> : null}
                {user.isPremium ? <Badge>Premium</Badge> : null}
              </div>
            </SheetHeader>

            <Separator className="my-4" />

            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="moderation">Moderation</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-3 pt-4 text-sm">
                <Row label="ID" value={user.id} />
                <Row label="Country" value={user.country ?? "—"} />
                <Row label="City" value={user.city ?? "—"} />
                <Row
                  label="Joined"
                  value={new Date(user.createdAt).toLocaleString()}
                />
              </TabsContent>

              <TabsContent value="activity" className="space-y-3 pt-4 text-sm">
                <Row label="Matches" value={String(user.matchesCount)} />
                <Row
                  label="Last active"
                  value={
                    user.lastActiveAt
                      ? new Date(user.lastActiveAt).toLocaleString()
                      : "—"
                  }
                />
              </TabsContent>

              <TabsContent value="moderation" className="space-y-3 pt-4 text-sm">
                <Row label="Reports" value={String(user.reportCount)} />
              </TabsContent>
            </Tabs>

            <Separator className="my-4" />

            <PermissionGate require={PERMISSIONS.USERS_MODERATE}>
              <div className="flex flex-wrap gap-2">
                {!user.isVerified ? (
                  <Button
                    variant="outline"
                    onClick={() => verifyMutation.mutate(user.id)}
                    disabled={verifyMutation.isPending}
                  >
                    <CheckCircle2 />
                    {t("actions.verify")}
                  </Button>
                ) : null}
                {user.status === "banned" ? (
                  <Button
                    variant="outline"
                    onClick={() => unbanMutation.mutate(user.id)}
                    disabled={unbanMutation.isPending}
                  >
                    <Undo2 />
                    {t("actions.unban")}
                  </Button>
                ) : (
                  <Button variant="destructive" onClick={() => setBanOpen(true)}>
                    <ShieldOff />
                    {t("actions.ban")}
                  </Button>
                )}
              </div>
            </PermissionGate>

            <ConfirmDialog
              open={banOpen}
              onOpenChange={setBanOpen}
              title={t("ban.title")}
              description={t("ban.description")}
              confirmLabel={t("ban.confirm")}
              destructive
              typedConfirmationValue="BAN"
              loading={banMutation.isPending}
              onConfirm={() => banMutation.mutate(user.id)}
            />
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate font-medium">{value}</span>
    </div>
  );
}
