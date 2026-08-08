"use client";

import { format, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import { Crown, Goal, Handshake, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MatchVoteModel } from "@/types";
import type { DayHighlights } from "../../_components/utils";

type WeekDayCardProps = {
  day: Date;
  now: Date;
  votes: MatchVoteModel[];
  highlights?: DayHighlights;
  isVotable: boolean;
  isVoted: boolean;
  isMatch: boolean;
  canVote: boolean;
  onVote: (d: Date) => void;
  onDetail: (d: Date) => void;
};

// One day in the weekly view — a compact, shareable card: weekday + date, vote
// count, match headline, and Vote / Chi tiết actions.
export const WeekDayCard = ({
  day,
  now,
  votes,
  highlights,
  isVotable,
  isVoted,
  isMatch,
  canVote,
  onVote,
  onDetail,
}: WeekDayCardProps) => {
  const players = votes.length;
  const guests = votes.reduce((s, v) => s + v.guestCount, 0);
  const heads = players + guests;
  const isToday = isSameDay(day, now);

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border p-3 transition-colors",
        isMatch && "ring-1 ring-primary",
        isVoted && "bg-primary/10",
        isVotable && "bg-emerald-500/10",
        isToday && "border-primary",
      )}
    >
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold capitalize">
          {format(day, "EEEE", { locale: vi })}
        </span>
        <span
          className={cn(
            "text-xs",
            isToday ? "font-semibold text-primary" : "text-muted-foreground",
          )}
        >
          {format(day, "dd/MM")}
        </span>
      </div>

      {players > 0 ? (
        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
          <Users className="size-3.5" />
          {heads} suất
          {guests > 0 ? (
            <span className="text-muted-foreground">({players} + {guests})</span>
          ) : null}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">Chưa ai vote</span>
      )}

      {highlights &&
      (highlights.mvp.length || highlights.topScorer || highlights.topAssist) ? (
        <div className="flex flex-col gap-0.5 text-xs">
          {highlights.mvp.length ? (
            <span className="flex items-center gap-1 text-amber-500">
              <Crown className="size-3 shrink-0" />
              <span className="truncate">{highlights.mvp.join(", ")}</span>
            </span>
          ) : null}
          {highlights.topScorer ? (
            <span className="flex items-center gap-1 text-primary">
              <Goal className="size-3 shrink-0" />
              <span className="truncate">
                {highlights.topScorer.name} ({highlights.topScorer.value})
              </span>
            </span>
          ) : null}
          {highlights.topAssist ? (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Handshake className="size-3 shrink-0" />
              <span className="truncate">
                {highlights.topAssist.name} ({highlights.topAssist.value})
              </span>
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-auto flex gap-2 pt-1">
        {canVote ? (
          <Button size="sm" className="h-7 flex-1 text-xs" onClick={() => onVote(day)}>
            {isVoted ? "Sửa vote" : "Vote"}
          </Button>
        ) : null}
        {players > 0 ? (
          <Button
            size="sm"
            variant="outline"
            className="h-7 flex-1 text-xs"
            onClick={() => onDetail(day)}
          >
            Chi tiết
          </Button>
        ) : null}
      </div>
    </div>
  );
};
