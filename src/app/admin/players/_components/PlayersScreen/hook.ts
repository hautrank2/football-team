"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { PlayerModel } from "@/types";
import {
  useDeletePlayer,
  usePlayers,
  useResetPlayerPassword,
} from "@/hooks";

const PAGE_SIZE = 20;

export const usePlayersScreen = () => {
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
    items: query.data?.items ?? [],
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
  };
};
