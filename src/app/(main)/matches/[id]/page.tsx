"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ArrowLeft, Crown, MapPin, Trash2, Wallet } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { MatchReportSection } from "@/components/schedule/match-report-section";
import { PaymentQrDialog } from "./_components/payment-qr-dialog";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isReportWindowOpen } from "@/constants/schedule";
import { useAuth } from "@/contexts";
import { formatVnd } from "@/lib/format";
import {
  useMatch,
  useRemoveParticipant,
  useRemoveParticipantsBulk,
  useSetPayment,
  useSetPaymentBulk,
  useSettleCost,
} from "@/hooks/schedule";
import { ROUTES } from "@/utils/routing";
import type { MatchPlayerModel } from "@/types";

const errMsg = (e: unknown) => String((e as { message?: unknown })?.message ?? "Lỗi");

const MatchDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const { data: match, isLoading } = useMatch(id);

  const now = useMemo(() => new Date(), []);
  const reportOpen = match ? isReportWindowOpen(new Date(match.kickoffAt), now) : false;

  const players = match?.players ?? [];
  const mine = players.find((p) => p.playerId === user?.id);
  const mvpIds = new Set(match?.mvpPlayerIds ?? []);

  // Admin bulk-payment selection — MatchPlayer ids that are ticked.
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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }
  if (!match) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-muted-foreground">Không tìm thấy trận đấu.</div>;
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 lg:px-8">
      <Button asChild variant="ghost" size="sm" className="w-fit -ml-2">
        <Link href={ROUTES.matches}>
          <ArrowLeft className="size-4" />
          Các trận đấu
        </Link>
      </Button>

      {/* Summary */}
      <div>
        <h1 className="text-2xl font-semibold capitalize">
          {format(new Date(match.matchDate), "EEEE, dd/MM/yyyy", { locale: vi })}
        </h1>
        <p className="flex flex-wrap items-center gap-3 text-muted-foreground">
          <span>{format(new Date(match.kickoffAt), "HH:mm")}</span>
          {match.location ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-4" />
              {match.location}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Wallet className="size-4" />
            {match.fieldCost != null
              ? `${formatVnd(match.fieldCost)}${match.costPerHead != null ? ` · ${formatVnd(match.costPerHead)}/suất` : ""}`
              : "Chưa nhập tiền sân"}
          </span>
          {isAdmin ? (
            <SettleCostDialog
              matchId={match.id}
              current={match.fieldCost ?? undefined}
            />
          ) : null}
          {match.costPerHead != null ? (
            <PaymentQrDialog amount={mine?.amountDue} />
          ) : null}
        </p>
      </div>

      {/* Participants */}
      <Card>
        <CardHeader className="sticky top-16 z-20 flex flex-row items-center justify-between gap-3 rounded-t-xl border-b bg-card pb-2">
          <CardTitle className="text-base">Danh sách tham gia ({players.length})</CardTitle>
          {isAdmin && selected.size > 0 ? (
            <div className="flex items-center gap-2">
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
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="p-0">
          <Table containerClassName="max-h-[60vh]">
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                {isAdmin ? (
                  <TableHead className="w-10 px-4">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(v) => toggleAll(v === true)}
                      aria-label="Chọn tất cả"
                    />
                  </TableHead>
                ) : null}
                <TableHead className="px-4">Cầu thủ</TableHead>
                <TableHead className="px-2 text-center">Khách</TableHead>
                <TableHead className="px-2 text-center">Bàn</TableHead>
                <TableHead className="px-2 text-center">Kiến tạo</TableHead>
                <TableHead className="px-2 text-right">Tiền</TableHead>
                <TableHead className="px-4 text-center">Đã trả</TableHead>
                {isAdmin ? <TableHead className="w-10 px-2" aria-label="Xóa" /> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((p) => (
                <ParticipantRow
                  key={p.id}
                  matchId={match.id}
                  p={p}
                  isMvp={mvpIds.has(p.playerId)}
                  isAdmin={isAdmin}
                  selected={selected.has(p.id)}
                  onSelect={(on) => toggleOne(p.id, on)}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Self report + MVP vote (report window only, participants only) */}
      {reportOpen && mine ? (
        <MatchReportSection matchId={match.id} mine={mine} participants={players} voterId={user?.id ?? ""} />
      ) : null}

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

export default MatchDetailPage;

const ParticipantRow = ({
  matchId,
  p,
  isMvp,
  isAdmin,
  selected,
  onSelect,
}: {
  matchId: string;
  p: MatchPlayerModel;
  isMvp: boolean;
  isAdmin: boolean;
  selected: boolean;
  onSelect: (on: boolean) => void;
}) => {
  const setPayment = useSetPayment();
  const remove = useRemoveParticipant();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const name = p.player?.fullName ?? p.player?.username ?? p.playerId;

  return (
    <TableRow>
      {isAdmin ? (
        <TableCell className="px-4">
          <Checkbox
            checked={selected}
            onCheckedChange={(v) => onSelect(v === true)}
            aria-label={`Chọn ${name}`}
          />
        </TableCell>
      ) : null}
      <TableCell className="px-4 font-medium">
        <span className="inline-flex items-center gap-1.5">
          {name}
          {isMvp ? <Crown className="size-3.5 text-amber-500" /> : null}
        </span>
      </TableCell>
      <TableCell className="text-center">{p.guestCount || "—"}</TableCell>
      <TableCell className="text-center">{p.goals}</TableCell>
      <TableCell className="text-center">{p.assists}</TableCell>
      <TableCell className="text-right">{p.amountDue ? formatVnd(p.amountDue) : "—"}</TableCell>
      <TableCell className="px-4 text-center">
        {isAdmin ? (
          <Button
            size="sm"
            variant={p.isPaid ? "default" : "outline"}
            onClick={() =>
              setPayment.mutate(
                { id: matchId, pid: p.id, body: { isPaid: !p.isPaid } },
                { onError: (e) => toast.error(errMsg(e)) }
              )
            }
          >
            {p.isPaid ? "Đã trả" : "Chưa"}
          </Button>
        ) : (
          <Badge variant={p.isPaid ? "default" : "outline"}>
            {p.isPaid ? "Đã trả" : "Chưa"}
          </Badge>
        )}
      </TableCell>
      {isAdmin ? (
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
                }
              )
            }
          />
        </TableCell>
      ) : null}
    </TableRow>
  );
};

// Admin-only popup to enter/edit the field cost. The trigger reads "Nhập tiền
// sân" the first time and "Sửa tiền sân" once a cost exists. Saving recomputes
// every participant's amountDue on the server.
const SettleCostDialog = ({ matchId, current }: { matchId: string; current?: number }) => {
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
        <Button variant="outline" size="sm">
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
                }
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
