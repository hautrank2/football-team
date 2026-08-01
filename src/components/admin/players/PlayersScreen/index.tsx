"use client";

import { KeyRound, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { Pagination } from "@/components/admin/Pagination";
import { PlayerFormDialog } from "@/components/admin/players/PlayerFormDialog";
import { playerTitleLabel } from "@/lib/player-meta";
import { usePlayersScreen } from "./hook";
import type { PlayersScreenProps } from "./type";

export type { PlayersScreenProps };

export const PlayersScreen = () => {
  const s = usePlayersScreen();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Players</h1>
        <Button onClick={s.openCreate}>
          <Plus className="size-4" />
          Thêm cầu thủ
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={s.fullName}
          onChange={(e) => s.onSearch(e.target.value)}
          placeholder="Tìm theo họ tên…"
          className="pl-8"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Tài khoản</TableHead>
              <TableHead>Danh xưng</TableHead>
              <TableHead>Đội</TableHead>
              <TableHead className="w-16">Số áo</TableHead>
              <TableHead className="w-32 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {s.isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Đang tải…
                </TableCell>
              </TableRow>
            ) : s.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Chưa có cầu thủ nào
                </TableCell>
              </TableRow>
            ) : (
              s.items.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">
                    {player.fullName}
                    {player.nickname ? (
                      <span className="ml-1 text-muted-foreground">({player.nickname})</span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{player.username}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{playerTitleLabel(player.title)}</Badge>
                  </TableCell>
                  <TableCell>{player.team?.name ?? "—"}</TableCell>
                  <TableCell>{player.jerseyNumber ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Sửa"
                        onClick={() => s.openEdit(player)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Reset mật khẩu"
                        onClick={() => s.setResetting(player)}
                      >
                        <KeyRound className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Xóa"
                        onClick={() => s.setDeleting(player)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination page={s.page} totalPage={s.totalPage} total={s.total} onChange={s.setPage} />

      <PlayerFormDialog open={s.formOpen} player={s.editing} onOpenChange={s.setFormOpen} />

      <DeleteDialog
        open={!!s.deleting}
        title="Xóa cầu thủ?"
        description={
          s.deleting ? `Xóa cầu thủ "${s.deleting.fullName}" không thể hoàn tác.` : undefined
        }
        loading={s.isDeleting}
        onOpenChange={(open) => !open && s.setDeleting(null)}
        onConfirm={s.confirmDelete}
      />

      <DeleteDialog
        open={!!s.resetting}
        title="Reset mật khẩu?"
        description={
          s.resetting
            ? `Mật khẩu của "${s.resetting.username}" sẽ được đặt lại thành ${s.resetting.username}@123.`
            : undefined
        }
        confirmLabel="Reset"
        destructive={false}
        loading={s.isResetting}
        onOpenChange={(open) => !open && s.setResetting(null)}
        onConfirm={s.confirmReset}
      />
    </div>
  );
};
