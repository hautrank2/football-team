"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ArrowLeft, Crown, MapPin, Wallet } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { MatchReportSection } from "@/components/schedule/match-report-section";
import { PaymentQrDialog } from "./_components/payment-qr-dialog";
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
import { isReportWindowOpen } from "@/constants/schedule";
import { useAuth } from "@/contexts";
import { formatVnd } from "@/lib/format";
import {
  useMatch,
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
        <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
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
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b">
                {isAdmin ? (
                  <th className="px-4 py-2">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(v) => toggleAll(v === true)}
                      aria-label="Chọn tất cả"
                    />
                  </th>
                ) : null}
                <th className="px-4 py-2 font-medium">Cầu thủ</th>
                <th className="px-2 py-2 text-center font-medium">Khách</th>
                <th className="px-2 py-2 text-center font-medium">Bàn</th>
                <th className="px-2 py-2 text-center font-medium">Kiến tạo</th>
                <th className="px-2 py-2 text-right font-medium">Tiền</th>
                {isAdmin ? <th className="px-4 py-2 text-center font-medium">Đã trả</th> : null}
              </tr>
            </thead>
            <tbody>
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
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Self report + MVP vote (report window only, participants only) */}
      {reportOpen && mine ? (
        <MatchReportSection matchId={match.id} mine={mine} participants={players} voterId={user?.id ?? ""} />
      ) : null}
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
  const name = p.player?.fullName ?? p.player?.username ?? p.playerId;

  return (
    <tr className="border-b last:border-0">
      {isAdmin ? (
        <td className="px-4 py-2">
          <Checkbox
            checked={selected}
            onCheckedChange={(v) => onSelect(v === true)}
            aria-label={`Chọn ${name}`}
          />
        </td>
      ) : null}
      <td className="px-4 py-2">
        <span className="inline-flex items-center gap-1.5">
          {name}
          {isMvp ? <Crown className="size-3.5 text-amber-500" /> : null}
        </span>
      </td>
      <td className="px-2 py-2 text-center">{p.guestCount || "—"}</td>
      <td className="px-2 py-2 text-center">{p.goals}</td>
      <td className="px-2 py-2 text-center">{p.assists}</td>
      <td className="px-2 py-2 text-right">{p.amountDue ? formatVnd(p.amountDue) : "—"}</td>
      {isAdmin ? (
        <td className="px-4 py-2 text-center">
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
        </td>
      ) : null}
    </tr>
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
