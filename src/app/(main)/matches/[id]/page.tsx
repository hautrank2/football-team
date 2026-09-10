"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowLeft,
  Clock,
  Crown,
  Goal,
  Handshake,
  Lock,
  MapPin,
  Settings,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import { HighlightCard } from "./_components/highlight-card";
import { ParticipantCard } from "./_components/participant-card";
import { PaymentQrDialog } from "./_components/payment-qr-dialog";
import { ReportStatsDialog } from "./_components/report-stats-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { isReportWindowOpen, reportWindow } from "@/constants/schedule";
import { useAuth } from "@/contexts";
import { formatVnd } from "@/lib/format";
import { useMatch, useMyMvpVote, useVoteMvp } from "@/hooks/schedule";
import { adminMatchHref, loginRedirectHref, ROUTES } from "@/utils/routing";
import type { PlayerModel } from "@/types";

const errMsg = (e: unknown) =>
  String((e as { message?: unknown })?.message ?? "Lỗi");

const MatchDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { data: match, isLoading } = useMatch(id);

  const now = useMemo(() => new Date(), []);
  const kickoffAt = match ? new Date(match.kickoffAt) : null;
  const reportOpen = kickoffAt ? isReportWindowOpen(kickoffAt, now) : false;
  const deadline = kickoffAt ? reportWindow(kickoffAt).end : null;

  const players = match?.players ?? [];
  const mine = players.find((p) => p.playerId === user?.id);
  const mvpIds = new Set(match?.mvpPlayerIds ?? []);

  // My own ballot — decides whether a card's button reads "Bầu MVP" or "Đã bầu".
  const myVoteQuery = useMyMvpVote(reportOpen ? id : undefined, user?.id);
  const myMvpId = myVoteQuery.data?.mvpPlayerId ?? null;
  const voteMvp = useVoteMvp();

  const onVote = (mvpPlayerId: string) => {
    if (!user || !match) return;
    voteMvp.mutate(
      { id: match.id, body: { voterId: user.id, mvpPlayerId } },
      {
        onSuccess: () => toast.success("Đã bầu MVP"),
        onError: (e) => toast.error(errMsg(e)),
      },
    );
  };

  // Highlights: the player(s) with the most goals / assists (ties → several),
  // and the MVP(s). Only participants with a populated player + a positive stat.
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
  const hasHighlights =
    topScorers.length > 0 || topAssists.length > 0 || mvps.length > 0;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }
  if (!match) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-muted-foreground">
        Không tìm thấy trận đấu.
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
          <Link href={ROUTES.matches}>
            <ArrowLeft className="size-4" />
            Các trận đấu
          </Link>
        </Button>
        {isAdmin ? (
          <Button asChild variant="outline" size="sm">
            <Link href={adminMatchHref(match.id)}>
              <Settings className="size-4" />
              Quản lý tiền
            </Link>
          </Button>
        ) : null}
      </div>

      {/* Deadline + the self-report action, together at the very top: the thing
          you must do, next to how long you have left to do it. */}
      {deadline ? (
        reportOpen ? (
          <div className="flex flex-col gap-3 rounded-md border border-primary/40 bg-primary/5 p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-sm">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                Hạn khai báo &amp; bầu MVP:{" "}
                <span className="font-semibold">
                  {format(deadline, "HH:mm 'ngày' dd/MM/yyyy")}
                </span>
              </span>
            </p>
            {mine && user ? (
              <ReportStatsDialog
                matchId={match.id}
                mine={mine}
                playerId={user.id}
              />
            ) : null}
          </div>
        ) : (
          <p className="flex items-start gap-2 rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
            <Lock className="mt-0.5 size-4 shrink-0" />
            <span>
              Đã hết hạn khai báo &amp; bầu MVP (
              {format(deadline, "HH:mm 'ngày' dd/MM/yyyy")}).
            </span>
          </p>
        )
      ) : null}

      {/* Summary */}
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
          <span className="inline-flex items-center gap-1">
            <Wallet className="size-4" />
            {match.fieldCost != null
              ? `${formatVnd(match.fieldCost)}${match.costPerHead != null ? ` · ${formatVnd(match.costPerHead)}/suất` : ""}`
              : "Chưa nhập tiền sân"}
          </span>
          {match.costPerHead != null ? (
            <PaymentQrDialog amount={mine?.amountDue} />
          ) : null}
        </p>
      </div>

      {/* Highlights — a lone winner gets a hero card, a tie gets a podium list.
          MVP sits in the middle, in gold: it's the award that outranks the other
          two, so it takes the centre of the podium. */}
      {hasHighlights ? (
        <div className="grid gap-3 md:grid-cols-3">
          <HighlightCard
            title="Vua phá lưới"
            icon={Goal}
            entries={topScorers}
            unit="bàn"
          />
          <HighlightCard
            title="MVP"
            icon={Crown}
            entries={mvps}
            king
            // Before the deadline these are the current leader(s), not a result.
            provisional={match.mvpFinalized === false}
          />
          <HighlightCard
            title="Vua kiến tạo"
            icon={Handshake}
            entries={topAssists}
            unit="kiến tạo"
          />
        </div>
      ) : null}

      {/* Participants — one card each, with the MVP ballot on the card itself. */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          Danh sách tham gia ({players.length})
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {players.map((p) => (
            <ParticipantCard
              key={p.id}
              p={p}
              isMe={p.playerId === user?.id}
              isMvp={mvpIds.has(p.playerId)}
              votedForThem={myMvpId === p.playerId}
              // Only a participant may vote, and only inside the window.
              canVote={reportOpen && (!user || !!mine)}
              isVoting={voteMvp.isPending}
              onVote={() =>
                // Guests: sign in first, then come straight back to this match.
                user ? onVote(p.playerId) : router.push(loginRedirectHref())
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchDetailPage;
