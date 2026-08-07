"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { AlertTriangle, ArrowLeft, Crown, MapPin, Wallet } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { isReportWindowOpen, SCHEDULE_LIMITS } from "@/constants/schedule";
import { useAuth } from "@/contexts";
import { formatVnd } from "@/lib/format";
import {
  useMatch,
  useReportStats,
  useSetPayment,
  useSettleCost,
  useVoteMvp,
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
            {match.costPerHead != null
              ? `${formatVnd(match.costPerHead)}/suất`
              : "Chưa nhập tiền sân"}
          </span>
        </p>
      </div>

      {/* Participants */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Danh sách tham gia ({players.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b">
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
                <ParticipantRow key={p.id} matchId={match.id} p={p} isMvp={mvpIds.has(p.playerId)} isAdmin={isAdmin} />
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Self report + MVP vote (report window only, participants only) */}
      {reportOpen && mine ? (
        <ReportSection matchId={match.id} mine={mine} participants={players} voterId={user?.id ?? ""} />
      ) : null}

      {/* Admin: settle cost */}
      {isAdmin ? <SettleCostSection matchId={match.id} current={match.fieldCost ?? undefined} /> : null}
    </div>
  );
};

export default MatchDetailPage;

const ParticipantRow = ({
  matchId,
  p,
  isMvp,
  isAdmin,
}: {
  matchId: string;
  p: MatchPlayerModel;
  isMvp: boolean;
  isAdmin: boolean;
}) => {
  const setPayment = useSetPayment();
  const name = p.player?.fullName ?? p.player?.username ?? p.playerId;

  return (
    <tr className="border-b last:border-0">
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

const HonestyNote = () => (
  <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
    <span>Vui lòng nhập trung thực. Số liệu do chính bạn tự khai và ảnh hưởng tới bảng xếp hạng của cả đội.</span>
  </div>
);

const ReportSection = ({
  matchId,
  mine,
  participants,
  voterId,
}: {
  matchId: string;
  mine: MatchPlayerModel;
  participants: MatchPlayerModel[];
  voterId: string;
}) => {
  const [goals, setGoals] = useState(mine.goals);
  const [assists, setAssists] = useState(mine.assists);
  const [mvp, setMvp] = useState<string>("");

  useEffect(() => {
    setGoals(mine.goals);
    setAssists(mine.assists);
  }, [mine.goals, mine.assists]);

  const report = useReportStats();
  const voteMvp = useVoteMvp();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Nhập kết quả của bạn</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <HonestyNote />
        <div className="flex items-end gap-3">
          <div className="w-28">
            <Label className="text-xs">Bàn thắng</Label>
            <Input
              type="number"
              min={0}
              max={SCHEDULE_LIMITS.GOALS_MAX}
              value={goals}
              onChange={(e) => setGoals(Math.max(0, Number(e.target.value) || 0))}
            />
          </div>
          <div className="w-28">
            <Label className="text-xs">Kiến tạo</Label>
            <Input
              type="number"
              min={0}
              max={SCHEDULE_LIMITS.ASSISTS_MAX}
              value={assists}
              onChange={(e) => setAssists(Math.max(0, Number(e.target.value) || 0))}
            />
          </div>
          <Button
            onClick={() =>
              report.mutate(
                { id: matchId, body: { playerId: voterId, goals, assists } },
                {
                  onSuccess: () => toast.success("Đã lưu bàn thắng/kiến tạo"),
                  onError: (e) => toast.error(errMsg(e)),
                }
              )
            }
            disabled={report.isPending}
          >
            Lưu
          </Button>
        </div>

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Label className="text-xs">Bầu MVP</Label>
            <Select value={mvp} onValueChange={setMvp}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn cầu thủ xuất sắc nhất" />
              </SelectTrigger>
              <SelectContent>
                {participants.map((p) => (
                  <SelectItem key={p.playerId} value={p.playerId}>
                    {p.player?.fullName ?? p.player?.username ?? p.playerId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            disabled={!mvp || voteMvp.isPending}
            onClick={() =>
              voteMvp.mutate(
                { id: matchId, body: { voterId, mvpPlayerId: mvp } },
                {
                  onSuccess: () => toast.success("Đã bầu MVP"),
                  onError: (e) => toast.error(errMsg(e)),
                }
              )
            }
          >
            <Crown className="size-4" />
            Bầu
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const SettleCostSection = ({ matchId, current }: { matchId: string; current?: number }) => {
  const [cost, setCost] = useState<number>(current ?? 0);
  const settle = useSettleCost();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Tiền sân (admin)</CardTitle>
      </CardHeader>
      <CardContent className="flex items-end gap-3">
        <div className="flex-1">
          <Label className="text-xs">Tổng tiền sân (VND)</Label>
          <Input
            type="number"
            min={0}
            value={cost}
            onChange={(e) => setCost(Math.max(0, Number(e.target.value) || 0))}
          />
        </div>
        <Button
          onClick={() =>
            settle.mutate(
              { id: matchId, body: { fieldCost: cost } },
              {
                onSuccess: () => toast.success("Đã chia tiền cho danh sách tham gia"),
                onError: (e) => toast.error(errMsg(e)),
              }
            )
          }
          disabled={settle.isPending}
        >
          Chia tiền
        </Button>
      </CardContent>
    </Card>
  );
};
