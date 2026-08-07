"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarDays, Goal, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMatches } from "@/hooks/schedule";
import { matchHref } from "@/utils/routing";
import type { MatchModel, MatchStatusEnum } from "@/types";

const STATUS: Record<MatchStatusEnum, { label: string; variant: "default" | "secondary" | "outline" }> = {
  SCHEDULED: { label: "Sắp đá", variant: "secondary" },
  FINISHED: { label: "Đã đá", variant: "default" },
  CANCELLED: { label: "Đã huỷ", variant: "outline" },
};

const MatchesPage = () => {
  const { data, isLoading } = useMatches({
    populations: ["players"],
    pageSize: 50,
    sortBy: "matchDate",
    order: "desc",
  });
  const matches = data?.items ?? [];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold">Các trận đấu</h1>
        <p className="text-muted-foreground">Danh sách trận đã chốt, người tham gia và bàn thắng.</p>
      </div>

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
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchesPage;

const MatchCard = ({ match }: { match: MatchModel }) => {
  const players = match.players ?? [];
  const goals = players.reduce((s, p) => s + p.goals, 0);
  const status = STATUS[match.status];

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
