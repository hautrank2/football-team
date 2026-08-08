"use client";

import { Crown } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { MatchReportSection } from "@/components/schedule/match-report-section";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isReportWindowOpen } from "@/constants/schedule";
import { useMatch } from "@/hooks/schedule";
import { matchHref } from "@/utils/routing";
import type { MatchPlayerModel, MatchVoteModel } from "@/types";

// For a day with a confirmed match: always show the result table (goals/assists
// + MVP) to everyone; additionally show the self-report form when I'm a
// participant and the post-match window is still open. Renders nothing for days
// without a match. Used by both the vote dialog and the read-only detail dialog.
export const DayMatchReport = ({
  dayVotes,
  playerId,
}: {
  dayVotes: MatchVoteModel[];
  playerId: string;
}) => {
  const now = useMemo(() => new Date(), []);
  const matchId = dayVotes.find((v) => v.matchId)?.matchId ?? undefined;
  const matchQuery = useMatch(matchId ?? undefined);
  const match = matchQuery.data;
  const participants = useMemo(() => match?.players ?? [], [match]);
  const myMatchPlayer = participants.find((p) => p.playerId === playerId);
  const reportOpen = match
    ? isReportWindowOpen(new Date(match.kickoffAt), now)
    : false;

  if (!match) return null;

  const mvpIds = new Set(match.mvpPlayerIds ?? []);
  const playerName = (p: MatchPlayerModel) =>
    p.player?.fullName ?? p.player?.username ?? p.playerId;

  return (
    <div className="flex flex-col gap-3">
      {/* Result table — visible to everyone. */}
      <div className="rounded-md border p-3">
        <div className="mb-2 text-sm font-medium">Kết quả trận đấu</div>
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead className="h-8 px-2">Cầu thủ</TableHead>
              <TableHead className="h-8 px-2 text-center">Bàn</TableHead>
              <TableHead className="h-8 px-2 text-center">Kiến tạo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="px-2 py-1 font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    {playerName(p)}
                    {mvpIds.has(p.playerId) ? (
                      <Crown className="size-3.5 text-amber-500" />
                    ) : null}
                  </span>
                </TableCell>
                <TableCell className="px-2 py-1 text-center">
                  {p.goals}
                </TableCell>
                <TableCell className="px-2 py-1 text-center">
                  {p.assists}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {mvpIds.size === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            {reportOpen
              ? "MVP sẽ được chốt sau khi hết hạn bầu chọn."
              : "Trận này chưa có MVP (không có phiếu bầu)."}
          </p>
        ) : null}
      </div>

      {/* Self-report form — only while the window is open and I took part. */}
      {reportOpen && myMatchPlayer ? (
        <MatchReportSection
          matchId={match.id}
          mine={myMatchPlayer}
          participants={participants}
          voterId={playerId}
        />
      ) : null}

      <Button asChild variant="outline" className="w-fit">
        <Link href={matchHref(match.id)}>Xem chi tiết trận đấu</Link>
      </Button>
    </div>
  );
};
