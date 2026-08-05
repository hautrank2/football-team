"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts";
import { useDeleteLineup, useLineups } from "@/hooks";
import { loginRedirectHref } from "@/utils/routing";

export const useLineupListPage = () => {
  const router = useRouter();
  const { user, isReady } = useAuth();

  // Guests can't build lineups — send them to login.
  useEffect(() => {
    if (isReady && !user) router.replace(loginRedirectHref());
  }, [isReady, user, router]);

  const mineQuery = useLineups(
    { ownerId: user?.id, pageSize: 100, sortBy: "updatedAt", order: "desc" },
    !!user
  );
  const publicQuery = useLineups(
    { isPublic: true, pageSize: 100, sortBy: "updatedAt", order: "desc", populations: ["owner"] },
    !!user
  );

  const mine = useMemo(() => mineQuery.data?.items ?? [], [mineQuery.data]);
  // Public lineups from OTHER users (mine already show in the section above).
  const community = useMemo(
    () => (publicQuery.data?.items ?? []).filter((l) => l.ownerId !== user?.id),
    [publicQuery.data, user?.id]
  );

  const deleteMutation = useDeleteLineup();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteMutation.mutate(pendingDelete, {
      onSuccess: () => {
        toast.success("Đã xóa đội hình");
        setPendingDelete(null);
      },
      onError: () => toast.error("Không thể xóa, vui lòng thử lại"),
    });
  };

  return {
    user,
    mine,
    community,
    isLoading: !isReady || mineQuery.isPending,
    pendingDelete,
    setPendingDelete,
    confirmDelete,
    isDeleting: deleteMutation.isPending,
  };
};
