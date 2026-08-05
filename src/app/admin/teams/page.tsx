"use client";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActionButton } from "@/components/admin/ActionButton";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { Pagination } from "@/components/admin/Pagination";
import { TeamFormDialog } from "./_components/TeamFormDialog";
import { useTeamsPage } from "./hook";
import Link from "next/link";

const TeamsPage = () => {
  const s = useTeamsPage();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Teams</h1>
        <Button onClick={s.openCreate}>
          <Plus className="size-4" />
          Thêm đội
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={s.name}
          onChange={(e) => s.onSearch(e.target.value)}
          placeholder="Tìm theo tên…"
          className="pl-8"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên đội</TableHead>
              <TableHead>Viết tắt</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="w-32 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {s.isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  Đang tải…
                </TableCell>
              </TableRow>
            ) : s.items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  Chưa có đội nào
                </TableCell>
              </TableRow>
            ) : (
              s.items.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/teams/${team.id}`}>{team.name}</Link>
                  </TableCell>
                  <TableCell>{team.shortName ?? "—"}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {team.description ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <ActionButton
                        tooltip="Sửa"
                        onClick={() => s.openEdit(team)}
                      >
                        <Pencil className="size-4" />
                      </ActionButton>
                      <ActionButton
                        tooltip="Xóa"
                        onClick={() => s.setDeleting(team)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </ActionButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        page={s.page}
        totalPage={s.totalPage}
        total={s.total}
        onChange={s.setPage}
      />

      <TeamFormDialog
        open={s.formOpen}
        team={s.editing}
        onOpenChange={s.setFormOpen}
      />

      <DeleteDialog
        open={!!s.deleting}
        title="Xóa đội?"
        description={
          s.deleting
            ? `Xóa đội "${s.deleting.name}" không thể hoàn tác.`
            : undefined
        }
        loading={s.isDeleting}
        onOpenChange={(open) => !open && s.setDeleting(null)}
        onConfirm={s.confirmDelete}
      />
    </div>
  );
};

export default TeamsPage;
