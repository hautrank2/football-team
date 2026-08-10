"use client";

import {
  ImageIcon,
  KeyRound,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { playerTitleLabel } from "@/lib/player-meta";
import { PlayerAvatarDialog } from "./_components/PlayerAvatarDialog";
import { PlayerFormDialog } from "./_components/PlayerFormDialog";
import { PlayerRemoveBgBatchDialog } from "./_components/PlayerRemoveBgBatchDialog";
import { PlayerRemoveBgDialog } from "./_components/PlayerRemoveBgDialog";
import { usePlayersPage } from "./hook";
import Link from "next/link";

const PlayersPage = () => {
  const s = usePlayersPage();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Players</h1>
        <div className="flex items-center gap-2">
          {s.selectedCount > 0 ? (
            <Button variant="outline" onClick={() => s.setBatchOpen(true)}>
              <Sparkles className="size-4" />
              Xóa nền ({s.selectedCount})
            </Button>
          ) : null}
          <Button onClick={s.openCreate}>
            <Plus className="size-4" />
            Thêm cầu thủ
          </Button>
        </div>
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
        <Table containerClassName="max-h-[65vh]">
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={s.allSelected ? true : s.someSelected ? "indeterminate" : false}
                  onCheckedChange={s.toggleAll}
                  aria-label="Chọn tất cả"
                  disabled={s.items.length === 0}
                />
              </TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Tài khoản</TableHead>
              <TableHead>Danh xưng</TableHead>
              <TableHead>Đội</TableHead>
              <TableHead className="w-16">Số áo</TableHead>
              <TableHead className="w-52 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {s.isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  Đang tải…
                </TableCell>
              </TableRow>
            ) : s.items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  Chưa có cầu thủ nào
                </TableCell>
              </TableRow>
            ) : (
              s.items.map((player) => (
                <TableRow
                  key={player.id}
                  data-state={s.selectedIds.has(player.id) ? "selected" : undefined}
                >
                  <TableCell className="w-10">
                    <Checkbox
                      checked={s.selectedIds.has(player.id)}
                      onCheckedChange={() => s.toggleSelect(player.id)}
                      aria-label={`Chọn ${player.fullName}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-8">
                        <AvatarImage
                          src={player.avatarUrl ?? undefined}
                          className="object-cover"
                        />
                        <AvatarFallback>
                          {player.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        <Link
                          href={`/admin/players/${player.id}`}
                          className="hover:underline"
                        >
                          {player.fullName}
                        </Link>
                        {player.nickname ? (
                          <span className="ml-1 text-muted-foreground">
                            ({player.nickname})
                          </span>
                        ) : null}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {player.username}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {playerTitleLabel(player.title)}
                    </Badge>
                  </TableCell>
                  <TableCell>{player.team?.name ?? "—"}</TableCell>
                  <TableCell>{player.jerseyNumber ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <ActionButton
                        tooltip="Sửa"
                        onClick={() => s.openEdit(player)}
                      >
                        <Pencil className="size-4" />
                      </ActionButton>
                      <ActionButton
                        tooltip="Đổi ảnh"
                        onClick={() => s.setAvatarEditing(player)}
                      >
                        <ImageIcon className="size-4" />
                      </ActionButton>
                      <ActionButton
                        tooltip="Xóa nền"
                        onClick={() => s.setBgRemoving(player)}
                      >
                        <Sparkles className="size-4" />
                      </ActionButton>
                      <ActionButton
                        tooltip="Reset mật khẩu"
                        onClick={() => s.setResetting(player)}
                      >
                        <KeyRound className="size-4" />
                      </ActionButton>
                      {player.role === "ADMIN" ? (
                        <ActionButton
                          tooltip="Không thể xóa tài khoản admin"
                          disabled
                        >
                          <Trash2 className="size-4 text-muted-foreground" />
                        </ActionButton>
                      ) : (
                        <ActionButton
                          tooltip="Xóa"
                          onClick={() => s.setDeleting(player)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </ActionButton>
                      )}
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

      <PlayerFormDialog
        open={s.formOpen}
        player={s.editing}
        onOpenChange={s.setFormOpen}
      />

      <PlayerAvatarDialog
        open={!!s.avatarEditing}
        player={s.avatarEditing}
        onOpenChange={(open) => !open && s.setAvatarEditing(null)}
      />

      <PlayerRemoveBgDialog
        open={!!s.bgRemoving}
        player={s.bgRemoving}
        onOpenChange={(open) => !open && s.setBgRemoving(null)}
      />

      <PlayerRemoveBgBatchDialog
        open={s.batchOpen}
        players={s.selectedPlayers}
        onOpenChange={s.setBatchOpen}
        onDone={s.clearSelection}
      />

      <DeleteDialog
        open={!!s.deleting}
        title="Xóa cầu thủ?"
        description={
          s.deleting
            ? `Xóa cầu thủ "${s.deleting.fullName}" không thể hoàn tác.`
            : undefined
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

export default PlayersPage;
