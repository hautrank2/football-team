"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ArrowLeft, Crown, Goal, Handshake, MapPin, Trash2, UserPlus, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { MatchReportSection } from "@/components/schedule/match-report-section";
import { PaymentQrDialog } from "./_components/payment-qr-dialog";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { PlayerPortrait } from "@/components/player/player-portrait";
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
import { isReportWindowOpen } from "@/constants/schedule";
import { useAuth } from "@/contexts";
import { usePlayers } from "@/hooks";
import { formatVnd } from "@/lib/format";
import { cardAccent } from "@/lib/player-card-theme";
import { cn } from "@/lib/utils";
import {
  useAddParticipant,
  useMatch,
  useRemoveParticipant,
  useRemoveParticipantsBulk,
  useSetPayment,
  useSetPaymentBulk,
  useSettleCost,
} from "@/hooks/schedule";
import { ROUTES } from "@/utils/routing";
import type { MatchPlayerModel, PlayerModel } from "@/types";

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

  // Highlights: the player(s) with the most goals / assists (ties → several), and
  // the MVP(s). Only participants with a populated player + a positive stat count.
  const topBy = (key: "goals" | "assists") => {
    const eligible = players.filter((p) => p.player && p[key] > 0);
    const max = eligible.reduce((m, p) => Math.max(m, p[key]), 0);
    return eligible
      .filter((p) => p[key] === max)
      .map((p) => ({ player: p.player as PlayerModel, value: p[key] }));
  };
  const topScorers = topBy("goals");
  const topAssists = topBy("assists");
  const mvps = (match?.mvpPlayers ?? []).map((player) => ({ player }));
  const hasHighlights = topScorers.length > 0 || topAssists.length > 0 || mvps.length > 0;

  // MOCK (remove later): stand-in highlight data (built from the current
  // participants) so the 3-column layout + many-players row can be previewed
  // while the real match has no reported stats yet.
  const MOCK_HIGHLIGHTS = true;
  const useMock = MOCK_HIGHLIGHTS && !hasHighlights;
  const mockPool = players
    .map((p) => p.player)
    .filter((pl): pl is PlayerModel => !!pl);
  const mockScorers = mockPool.slice(0, 8).map((player) => ({ player, value: 3 }));
  const mockAssists = mockPool.slice(0, 1).map((player) => ({ player, value: 5 }));
  const mockMvps = mockPool.slice(0, 2).map((player) => ({ player }));

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

      {/* Highlights — top scorer(s), top assister(s), MVP(s). Ties share a card,
          their portraits in one row. 3 columns on large screens, stacked below. */}
      {useMock || hasHighlights ? (
        <div className="grid gap-3 lg:grid-cols-3">
          <HighlightCard
            title="Vua phá lưới"
            icon={Goal}
            entries={useMock ? mockScorers : topScorers}
            unit="bàn"
          />
          <HighlightCard
            title="Vua kiến tạo"
            icon={Handshake}
            entries={useMock ? mockAssists : topAssists}
            unit="kiến tạo"
          />
          <HighlightCard title="MVP" icon={Crown} entries={useMock ? mockMvps : mvps} />
        </div>
      ) : null}

      {/* Participants */}
      <Card>
        <CardHeader className="sticky top-16 z-20 flex flex-row items-center justify-between gap-3 rounded-t-xl border-b bg-card pb-2">
          <CardTitle className="text-base">Danh sách tham gia ({players.length})</CardTitle>
          {isAdmin ? (
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

// One player inside a highlight card: a background-removed cutout standing on a
// position-tinted stage with the jersey number ghosted behind, name + nickname
// below. Sized to read as a small FUT-style portrait.
const HighlightPlayer = ({ player }: { player: PlayerModel }) => {
  const accent = cardAccent(player.positions);
  return (
    <div className="flex w-24 shrink-0 flex-col sm:w-28">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl border">
        <div className={cn("absolute inset-0 bg-gradient-to-b", accent.stage)} />
        {player.jerseyNumber != null ? (
          <span className="pointer-events-none absolute right-1.5 top-0 select-none text-4xl font-black italic leading-none text-foreground/25">
            {player.jerseyNumber}
          </span>
        ) : null}
        <PlayerPortrait player={player} className="absolute inset-0" />
      </div>
      <div className="mt-1.5 min-w-0 text-center">
        <div className="truncate text-xs font-bold uppercase tracking-tight" title={player.fullName}>
          {player.fullName}
        </div>
        {player.nickname ? (
          <div className={cn("truncate text-[11px] font-medium", accent.text)}>
            {`"${player.nickname}"`}
          </div>
        ) : null}
      </div>
    </div>
  );
};

// One highlight card (Vua phá lưới / Vua kiến tạo / MVP). Ties share the card,
// their portraits laid out in one horizontal row. The shared stat sits in the
// header (all tied players have the same value).
const HighlightCard = ({
  title,
  icon: Icon,
  entries,
  unit,
}: {
  title: string;
  icon: LucideIcon;
  entries: { player: PlayerModel; value?: number }[];
  unit?: string;
}) => {
  const value = entries[0]?.value;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <Icon className="size-4 text-primary" />
        <CardTitle className="text-sm">{title}</CardTitle>
        {unit && value != null ? (
          <Badge variant="secondary" className="ml-auto font-semibold">
            {value} {unit}
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent className="pt-0">
        {entries.length ? (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {entries.map(({ player }) => (
              <HighlightPlayer key={player.id} player={player} />
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Chưa có</div>
        )}
      </CardContent>
    </Card>
  );
};

// Admin-only: add a player (+ guest count) to the participant list. The player
// dropdown lists everyone not already in the match. Adding re-splits the cost.
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

  const options = (playersQuery.data?.items ?? []).filter((p) => !existingIds.has(p.id));

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
      }
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
                  placeholder={options.length ? "Chọn cầu thủ" : "Tất cả đã trong danh sách"}
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
              onChange={(e) => setGuests(Math.max(0, Math.min(20, Number(e.target.value) || 0)))}
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
