"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarDays, Goal, MapPin, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { QuickMatchDialog } from "./_components/QuickMatchDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts";
import { useMatches } from "@/hooks/schedule";
import { matchHref } from "@/utils/routing";
import type { MatchModel } from "@/types";

type StatusBadge = {
  label: string;
  variant: "default" | "secondary" | "outline";
};

// Display status is derived, not read from match.status: the app never
// auto-transitions SCHEDULED → FINISHED, so a match whose kick-off has already
// passed must still read as "Đã đá" rather than "Sắp đá".
const displayStatus = (match: MatchModel, now: Date): StatusBadge => {
  if (match.status === "CANCELLED")
    return { label: "Đã huỷ", variant: "outline" };
  if (new Date(match.kickoffAt).getTime() <= now.getTime())
    return { label: "Đã đá", variant: "default" };
  return { label: "Sắp đá", variant: "secondary" };
};

const MatchesPage = () => {
  const now = useMemo(() => new Date(), []);
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading } = useMatches({
    populations: ["players"],
    pageSize: 50,
    sortBy: "matchDate",
    order: "desc",
  });
  const matches = data?.items ?? [];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Các trận đấu</h1>
          <p className="text-muted-foreground">Danh sách trận đã chốt, người tham gia và bàn thắng.</p>
        </div>
        {/* Admin shortcut: create a match without waiting for the vote step. */}
        {isAdmin ? (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Thêm trận đấu
          </Button>
        ) : null}
      </div>

      {isAdmin ? (
        <QuickMatchDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSuccess={(matchId) => router.push(matchHref(matchId))}
        />
      ) : null}

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <CalendarDays className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">Chưa có trận đấu nào.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {matches.map((m) => (
            <MatchCard key={m.id} match={m} now={now} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchesPage;

const MatchCard = ({ match, now }: { match: MatchModel; now: Date }) => {
  const players = match.players ?? [];
  const goals = players.reduce((s, p) => s + p.goals, 0);
  const status = displayStatus(match, now);

  return (
    <Link href={matchHref(match.id)} className="group">
      <Card className="h-full transition-colors group-hover:border-primary/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base capitalize">
              {format(new Date(match.matchDate), "EEEE, dd/MM/yyyy", { locale: vi })}
            </CardTitle>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            {format(new Date(match.kickoffAt), "HH:mm")}
            {match.location ? (
              <span className="ml-2 inline-flex items-center gap-1">
                <MapPin className="size-3" />
                {match.location}
              </span>
            ) : null}
          </span>
        </CardHeader>
        <CardContent className="flex gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="size-4" />
            {players.length} người
          </span>
          <span className="flex items-center gap-1">
            <Goal className="size-4" />
            {goals} bàn
          </span>
        </CardContent>
      </Card>
    </Link>
  );
};
