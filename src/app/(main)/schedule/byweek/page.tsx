"use client";

import { addWeeks, format, subWeeks } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { DayMatchReport } from "../_components/day-match-report";
import { DayPanel } from "../_components/day-panel";
import { LoginGate, Legend } from "../_components/schedule-shared";
import { dayKey } from "../_components/utils";
import { VoterRows } from "../_components/voter-rows";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { WeekDayCard } from "./_components/week-day-card";
import { useScheduleWeek } from "./hook";

const WeekContent = () => {
  const w = useScheduleWeek();

  if (w.isReady && !w.user) return <LoginGate />;

  const rangeLabel = `${format(w.weekStart, "dd/MM")} – ${format(w.weekEnd, "dd/MM/yyyy")}`;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Lịch tuần</h1>
          <p className="text-muted-foreground">
            7 ngày trong tuần — chia sẻ link này để mọi người vote nhanh. Vote
            khóa lúc 19h ngày đó.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/schedule">
              <CalendarDays className="size-4" />
              Xem theo tháng
            </Link>
          </Button>
          <Legend />
        </div>
      </div>

      {/* Week switcher */}
      <div className="flex items-center justify-between gap-2 rounded-xl border bg-card p-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Tuần trước"
          onClick={() => w.setWeek(subWeeks(w.weekStart, 1))}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold">{rangeLabel}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => w.setWeek(w.now)}
          >
            Tuần này
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Tuần sau"
          onClick={() => w.setWeek(addWeeks(w.weekStart, 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {w.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {w.weekDays.map((day) => {
            const key = dayKey(day);
            return (
              <WeekDayCard
                key={key}
                day={day}
                now={w.now}
                votes={w.votesByDay.get(key) ?? []}
                highlights={w.highlightsByDay.get(key)}
                isVotable={w.lookup.votableSet.has(key)}
                isVoted={w.lookup.votedSet.has(key)}
                isMatch={w.lookup.matchSet.has(key)}
                canVote={w.canVoteOn(day)}
                onVote={w.onVote}
                onDetail={w.onDetail}
              />
            );
          })}
        </div>
      )}

      {/* Vote dialog */}
      <Dialog open={w.voteDialog.open} onOpenChange={w.voteDialog.setOpen}>
        <DialogContent>
          {w.voteDialog.day ? (
            <>
              <DialogHeader>
                <DialogTitle className="capitalize">
                  {format(w.voteDialog.day, "EEEE, dd/MM/yyyy", { locale: vi })}
                </DialogTitle>
                <DialogDescription>
                  {w.voteDialog.votes.length} người ·{" "}
                  {w.voteDialog.votes.reduce((s, v) => s + 1 + v.guestCount, 0)} suất
                </DialogDescription>
              </DialogHeader>
              <DayPanel
                key={w.voteDialog.day.toISOString()}
                day={w.voteDialog.day}
                playerId={w.user?.id ?? ""}
                dayVotes={w.voteDialog.votes}
                onDone={() => w.voteDialog.setOpen(false)}
              />
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={w.detailDialog.open} onOpenChange={w.detailDialog.setOpen}>
        <DialogContent>
          {w.detailDialog.day ? (
            <>
              <DialogHeader>
                <DialogTitle className="capitalize">
                  {format(w.detailDialog.day, "EEEE, dd/MM/yyyy", { locale: vi })}
                </DialogTitle>
                <DialogDescription>Danh sách người đã vote</DialogDescription>
              </DialogHeader>
              <VoterRows votes={w.detailDialog.votes} />
              {w.user ? (
                <DayMatchReport
                  dayVotes={w.detailDialog.votes}
                  playerId={w.user.id}
                />
              ) : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// useSearchParams needs a Suspense boundary during prerender.
const ByWeekPage = () => (
  <Suspense fallback={null}>
    <WeekContent />
  </Suspense>
);

export default ByWeekPage;
