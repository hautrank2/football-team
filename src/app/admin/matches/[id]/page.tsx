"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowLeft,
  Crown,
  ExternalLink,
  MapPin,
  Trash2,
  UserPlus,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePlayers } from "@/hooks";
import {
  useAddParticipant,
  useMatch,
  useRemoveParticipant,
  useRemoveParticipantsBulk,
  useSetPayment,
  useSetPaymentBulk,
  useSettleCost,
} from "@/hooks/schedule";
import { formatVnd } from "@/lib/format";
import { matchHref, ROUTES } from "@/utils/routing";
import type { MatchPlayerModel } from "@/types";

const errMsg = (e: unknown) =>
  String((e as { message?: unknown })?.message ?? "Lỗi");

// /admin/matches/:id — money desk for one match: nhập tiền sân, chia suất,
// đánh dấu đã trả, thêm/xoá người tham gia. The player-facing view (highlights,
// MVP ballot, self-report) lives at /matches/:id.
const AdminMatchDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: match, isLoading } = useMatch(id);

  const players = match?.players ?? [];
  const mvpIds = new Set(match?.mvpPlayerIds ?? []);

  const paidTotal = players.reduce(
    (s, p) => s + (p.isPaid ? p.amountDue : 0),
    0,
  );
  const dueTotal = players.reduce((s, p) => s + (p.isPaid ? 0 : p.amountDue), 0);

  // Bulk-payment selection — MatchPlayer ids that are ticked.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const setPaymentBulk = useSetPaymentBulk();
  const removeBulk = useRemoveParticipantsBulk();
  const [removeOpen, setRemoveOpen] = useState(false);

  const toggleOne = (pid: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(pid);
      else next.delete(pid);
      return next;
    });
  const toggleAll = (on: boolean) =>
    setSelected(on ? new Set(players.map((p) => p.id)) : new Set());

  const markSelected = (isPaid: boolean) => {
    const pids = [...selected];
    if (!pids.length || !match) return;
    setPaymentBulk.mutate(
      { id: match.id, pids, isPaid },
      {
        onSuccess: () => {
          toast.success(
            `Đã đánh dấu ${pids.length} người ${isPaid ? "đã trả" : "chưa trả"}`,
          );
          setSelected(new Set());
        },
        onError: (e) => toast.error(errMsg(e)),
      },
    );
  };

  const removeSelected = () => {
    const pids = [...selected];
    if (!pids.length || !match) return;
    removeBulk.mutate(
      { id: match.id, pids },
      {
        onSuccess: () => {
          toast.success(`Đã xóa ${pids.length} người khỏi trận`);
          setSelected(new Set());
          setRemoveOpen(false);
        },
        onError: (e) => toast.error(errMsg(e)),
      },
    );
  };

  const allSelected = players.length > 0 && selected.size === players.length;

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;
  if (!match) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Không tìm thấy trận đấu.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link href={ROUTES.adminMatches}>
          <ArrowLeft className="size-4" />
          Trận đấu
        </Link>
      </Button>

      {/* Summary */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold capitalize">
            {format(new Date(match.matchDate), "EEEE, dd/MM/yyyy", {
              locale: vi,
            })}
          </h1>
          <p className="flex flex-wrap items-center gap-3 text-muted-foreground">
            <span>{format(new Date(match.kickoffAt), "HH:mm")}</span>
            {match.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-4" />
                {match.location}
              </span>
            ) : null}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={matchHref(match.id)}>
            Trang cầu thủ
            <ExternalLink className="size-4" />
          </Link>
        </Button>
      </div>

      {/* Money */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tiền sân</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Stat
            label="Tổng tiền sân"
            value={
              match.fieldCost != null ? formatVnd(match.fieldCost) : "Chưa nhập"
            }
          />
          <Stat
            label="Mỗi suất"
            value={
              match.costPerHead != null ? formatVnd(match.costPerHead) : "—"
            }
          />
          <Stat label="Số suất" value={String(match.totalHeads ?? "—")} />
          <Stat label="Đã thu" value={formatVnd(paidTotal)} />
          <Stat label="Còn thiếu" value={formatVnd(dueTotal)} />
          <SettleCostDialog
            matchId={match.id}
            current={match.fieldCost ?? undefined}
          />
        </CardContent>
      </Card>

      {/* Participants */}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b pb-2">
          <CardTitle className="text-base">
            Danh sách tham gia ({players.length})
          </CardTitle>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {selected.size > 0 ? (
              <>
                <span className="text-xs text-muted-foreground">
                  Đã chọn {selected.size}
                </span>
                <Button
                  size="sm"
                  onClick={() => markSelected(true)}
                  disabled={setPaymentBulk.isPending}
                >
                  Đánh dấu đã trả
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => markSelected(false)}
                  disabled={setPaymentBulk.isPending}
                >
                  Đánh dấu chưa trả
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setRemoveOpen(true)}
                  disabled={removeBulk.isPending}
                >
                  <Trash2 className="size-4" />
                  Xóa khỏi trận
                </Button>
              </>
            ) : null}
            <AddParticipantDialog
              matchId={match.id}
              existingIds={new Set(players.map((p) => p.playerId))}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table containerClassName="max-h-[60vh]">
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead className="w-10 px-4">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(v) => toggleAll(v === true)}
                    aria-label="Chọn tất cả"
                  />
                </TableHead>
                <TableHead className="px-4">Cầu thủ</TableHead>
                <TableHead className="px-2 text-center">Khách</TableHead>
                <TableHead className="px-2 text-center">Bàn</TableHead>
                <TableHead className="px-2 text-center">Kiến tạo</TableHead>
                <TableHead className="px-2 text-right">Tiền</TableHead>
                <TableHead className="px-4 text-center">Đã trả</TableHead>
                <TableHead className="w-10 px-2" aria-label="Xóa" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((p) => (
                <ParticipantRow
                  key={p.id}
                  matchId={match.id}
                  p={p}
                  isMvp={mvpIds.has(p.playerId)}
                  selected={selected.has(p.id)}
                  onSelect={(on) => toggleOne(p.id, on)}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DeleteDialog
        open={removeOpen}
        title="Xóa khỏi trận đấu?"
        description={`Gỡ ${selected.size} người khỏi danh sách tham gia. Vote của họ cho trận này cũng bị xóa.`}
        loading={removeBulk.isPending}
        onOpenChange={setRemoveOpen}
        onConfirm={removeSelected}
      />
    </div>
  );
};

export default AdminMatchDetailPage;

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="font-semibold">{value}</div>
  </div>
);

const ParticipantRow = ({
  matchId,
  p,
  isMvp,
  selected,
  onSelect,
}: {
  matchId: string;
  p: MatchPlayerModel;
  isMvp: boolean;
  selected: boolean;
  onSelect: (on: boolean) => void;
}) => {
  const setPayment = useSetPayment();
  const remove = useRemoveParticipant();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const name = p.player?.fullName ?? p.player?.username ?? p.playerId;

  return (
    <TableRow>
      <TableCell className="px-4">
        <Checkbox
          checked={selected}
          onCheckedChange={(v) => onSelect(v === true)}
          aria-label={`Chọn ${name}`}
        />
      </TableCell>
      <TableCell className="px-4 font-medium">
        <span className="inline-flex items-center gap-1.5">
          {name}
          {isMvp ? <Crown className="size-3.5 text-amber-500" /> : null}
        </span>
      </TableCell>
      <TableCell className="text-center">{p.guestCount || "—"}</TableCell>
      <TableCell className="text-center">{p.goals}</TableCell>
      <TableCell className="text-center">{p.assists}</TableCell>
      <TableCell className="text-right">
        {p.amountDue ? formatVnd(p.amountDue) : "—"}
      </TableCell>
      <TableCell className="px-4 text-center">
        <Button
          size="sm"
          variant={p.isPaid ? "default" : "outline"}
          onClick={() =>
            setPayment.mutate(
              { id: matchId, pid: p.id, body: { isPaid: !p.isPaid } },
              { onError: (e) => toast.error(errMsg(e)) },
            )
          }
        >
          {p.isPaid ? "Đã trả" : "Chưa"}
        </Button>
      </TableCell>
      <TableCell className="text-center">
        <Button
          size="icon"
          variant="ghost"
          className="size-8 text-destructive hover:text-destructive"
          aria-label={`Xóa ${name} khỏi trận`}
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 className="size-4" />
        </Button>
        <DeleteDialog
          open={confirmOpen}
          title="Xóa khỏi trận đấu?"
          description={`Gỡ "${name}" khỏi danh sách tham gia. Vote của họ cho trận này cũng bị xóa.`}
          loading={remove.isPending}
          onOpenChange={setConfirmOpen}
          onConfirm={() =>
            remove.mutate(
              { id: matchId, pid: p.id },
              {
                onSuccess: () => {
                  toast.success(`Đã xóa ${name} khỏi trận`);
                  setConfirmOpen(false);
                },
                onError: (e) => toast.error(errMsg(e)),
              },
            )
          }
        />
      </TableCell>
    </TableRow>
  );
};

// Add a player (+ guest count) to the participant list. The dropdown lists
// everyone not already in the match. Adding re-splits the cost.
const AddParticipantDialog = ({
  matchId,
  existingIds,
}: {
  matchId: string;
  existingIds: Set<string>;
}) => {
  const [open, setOpen] = useState(false);
  const [playerId, setPlayerId] = useState("");
  const [guests, setGuests] = useState(0);
  const playersQuery = usePlayers({ page: 1, pageSize: 500 });
  const add = useAddParticipant();

  // Reset the form each time the dialog opens.
  useEffect(() => {
    if (open) {
      setPlayerId("");
      setGuests(0);
    }
  }, [open]);

  const options = (playersQuery.data?.items ?? []).filter(
    (p) => !existingIds.has(p.id),
  );

  const onAdd = () => {
    if (!playerId) return;
    add.mutate(
      { id: matchId, body: { playerId, guestCount: guests } },
      {
        onSuccess: () => {
          toast.success("Đã thêm cầu thủ vào trận");
          setOpen(false);
        },
        onError: (e) => toast.error(errMsg(e)),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="size-4" />
          Thêm cầu thủ
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm cầu thủ vào trận</DialogTitle>
          <DialogDescription>
            Chọn cầu thủ và số khách họ dẫn theo. Nếu đã nhập tiền sân, hệ thống
            chia lại cho danh sách mới.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-xs">Cầu thủ</Label>
            <Select value={playerId} onValueChange={setPlayerId}>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    options.length ? "Chọn cầu thủ" : "Tất cả đã trong danh sách"
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {options.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.fullName}
                    {p.nickname ? ` (${p.nickname})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs">Số khách</Label>
            <Input
              type="number"
              min={0}
              max={20}
              value={guests}
              onChange={(e) =>
                setGuests(Math.max(0, Math.min(20, Number(e.target.value) || 0)))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onAdd} disabled={!playerId || add.isPending}>
            {add.isPending ? "Đang thêm…" : "Thêm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Enter/edit the field cost. Saving recomputes every participant's amountDue.
const SettleCostDialog = ({
  matchId,
  current,
}: {
  matchId: string;
  current?: number;
}) => {
  const [open, setOpen] = useState(false);
  const [cost, setCost] = useState<number>(current ?? 0);
  const settle = useSettleCost();
  const hasCost = current != null;

  // Re-seed the input from the latest saved value each time the popup opens.
  useEffect(() => {
    if (open) setCost(current ?? 0);
  }, [open, current]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <Wallet className="size-4" />
          {hasCost ? "Sửa tiền sân" : "Nhập tiền sân"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{hasCost ? "Sửa tiền sân" : "Nhập tiền sân"}</DialogTitle>
          <DialogDescription>
            Chia đều theo suất (mỗi người + khách của họ), làm tròn lên.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label className="text-xs">Tổng tiền sân (VND)</Label>
          <Input
            type="number"
            min={0}
            value={cost}
            onChange={(e) => setCost(Math.max(0, Number(e.target.value) || 0))}
          />
        </div>
        <DialogFooter>
          <Button
            onClick={() =>
              settle.mutate(
                { id: matchId, body: { fieldCost: cost } },
                {
                  onSuccess: () => {
                    toast.success("Đã chia tiền cho danh sách tham gia");
                    setOpen(false);
                  },
                  onError: (e) => toast.error(errMsg(e)),
                },
              )
            }
            disabled={settle.isPending}
          >
            {hasCost ? "Cập nhật" : "Chia tiền"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
