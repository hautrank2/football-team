"use client";

import type { Team } from "@prisma/client";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useDeleteTeam, useTeams } from "@/apis/team/queries";

const PAGE_SIZE = 20;

export const useTeamsScreen = () => {
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");

  const query = useTeams({
    page,
    pageSize: PAGE_SIZE,
    name: name || undefined,
    sortBy: "createdAt",
    order: "desc",
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [deleting, setDeleting] = useState<Team | null>(null);

  const del = useDeleteTeam();

  const onSearch = useCallback((value: string) => {
    setName(value);
    setPage(1);
  }, []);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((team: Team) => {
    setEditing(team);
    setFormOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleting) return;
    del.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Đã xóa đội");
        setDeleting(null);
      },
      onError: () => toast.error("Không thể xóa"),
    });
  }, [deleting, del]);

  return {
    items: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    totalPage: query.data?.totalPage ?? 1,
    isLoading: query.isPending,
    isError: query.isError,
    page,
    setPage,
    name,
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
  };
};
