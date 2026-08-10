"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { PlayerModel } from "@/types";
import { useDeletePlayer, usePlayers, useResetPlayerPassword } from "@/hooks";

const PAGE_SIZE = 20;

// Page logic colocated with page.tsx (see .agents/rules/nextjs.md).
export const usePlayersPage = () => {
  const [page, setPage] = useState(1);
  const [fullName, setFullName] = useState("");

  const query = usePlayers({
    page,
    pageSize: PAGE_SIZE,
    fullName: fullName || undefined,
    populations: ["team"],
    sortBy: "createdAt",
    order: "desc",
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PlayerModel | null>(null);
  const [deleting, setDeleting] = useState<PlayerModel | null>(null);
  const [resetting, setResetting] = useState<PlayerModel | null>(null);
  const [avatarEditing, setAvatarEditing] = useState<PlayerModel | null>(null);
  const [bgRemoving, setBgRemoving] = useState<PlayerModel | null>(null);

  const items = useMemo(() => query.data?.items ?? [], [query.data]);

  // Bulk selection (scoped to the current page — cleared when page/search change).
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchOpen, setBatchOpen] = useState(false);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, fullName]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      const allSelected = items.length > 0 && items.every((p) => prev.has(p.id));
      return allSelected ? new Set() : new Set(items.map((p) => p.id));
    });
  }, [items]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const allSelected = items.length > 0 && items.every((p) => selectedIds.has(p.id));
  const someSelected = items.some((p) => selectedIds.has(p.id)) && !allSelected;
  const selectedPlayers = items.filter((p) => selectedIds.has(p.id));

  const del = useDeletePlayer();
  const reset = useResetPlayerPassword();

  const onSearch = useCallback((value: string) => {
    setFullName(value);
    setPage(1);
  }, []);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((player: PlayerModel) => {
    setEditing(player);
    setFormOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleting) return;
    del.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Đã xóa cầu thủ");
        setDeleting(null);
      },
      onError: () => toast.error("Không thể xóa"),
    });
  }, [deleting, del]);

  const confirmReset = useCallback(() => {
    if (!resetting) return;
    const { id, username } = resetting;
    reset.mutate(
      { id, username },
      {
        onSuccess: () => {
          toast.success(`Đã reset mật khẩu: ${username}@123`);
          setResetting(null);
        },
        onError: () => toast.error("Không thể reset mật khẩu"),
      }
    );
  }, [resetting, reset]);

  return {
    items,
    total: query.data?.total ?? 0,
    totalPage: query.data?.totalPage ?? 1,
    isLoading: query.isPending,
    page,
    setPage,
    fullName,
    onSearch,
    formOpen,
    setFormOpen,
    editing,
    openCreate,
    openEdit,
    deleting,
    setDeleting,
    confirmDelete,
    isDeleting: del.isPending,
    resetting,
    setResetting,
    confirmReset,
    isResetting: reset.isPending,
    avatarEditing,
    setAvatarEditing,
    bgRemoving,
    setBgRemoving,
    selectedIds,
    toggleSelect,
    toggleAll,
    allSelected,
    someSelected,
    selectedPlayers,
    selectedCount: selectedIds.size,
    clearSelection,
    batchOpen,
    setBatchOpen,
  };
};
