"use client";

import { addMonths, format, subMonths } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarRange, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { CreateMatchButton } from "./_components/create-match-button";
import { DayMatchReport } from "./_components/day-match-report";
import { DayPanel } from "./_components/day-panel";
import { LoginGate, Legend } from "./_components/schedule-shared";
import { VoterRows } from "./_components/voter-rows";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useScheduleCalendar } from "./hook";

const ScheduleContent = () => {
  const { user, isReady, isLoading, month, setMonth, calendar, voteDialog, detailDialog } =
    useScheduleCalendar();

  if (isReady && !user) return <LoginGate />;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Lịch đấu</h1>
          <p className="text-muted-foreground">
            Chọn ngày bạn muốn chơi (tuần này &amp; 3 tuần kế tiếp). Vote khóa lúc
            19h ngày đó.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/schedule/byweek">
              <CalendarRange className="size-4" />
              Xem theo tuần
            </Link>
          </Button>
          <Legend />
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-[70vh] w-full rounded-2xl" />
      ) : (
        <div className="rounded-2xl border bg-card p-2 sm:p-6">
          {/* Month switcher (prev / next) */}
          <div className="mb-3 flex items-center justify-between px-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Tháng trước"
              onClick={() => setMonth(subMonths(month, 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-base font-semibold capitalize">
              {format(month, "LLLL yyyy", { locale: vi })}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Tháng sau"
              onClick={() => setMonth(addMonths(month, 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <TooltipProvider delayDuration={120}>
            <Calendar
              mode="single"
              locale={vi}
              month={month}
              onMonthChange={setMonth}
              selected={calendar.selected}
              onSelect={calendar.onDaySelect}
              modifiers={{
                votable: calendar.votableDays,
                voted: calendar.votedDays,
                hasMatch: calendar.matchDays,
              }}
              modifiersClassNames={{
                votable:
                  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 rounded-lg",
                voted: "bg-primary/20 rounded-lg",
                hasMatch: "ring-1 ring-primary rounded-lg",
              }}
              components={calendar.components}
              // Big, full-width calendar: scale every cell with the viewport.
              className="w-full [--cell-size:clamp(3rem,10vw,6rem)]"
              classNames={{
                root: "w-full",
                month: "flex w-full flex-col gap-2",
                nav: "hidden",
                month_caption: "hidden",
                // Rows flush against each other (no gap between week rows).
                week: "flex w-full",
              }}
            />
          </TooltipProvider>
        </div>
      )}

      {/* Vote dialog (also the mobile/tablet entry point — includes the detail list). */}
      <Dialog open={voteDialog.open} onOpenChange={voteDialog.setOpen}>
        <DialogContent>
          {voteDialog.day ? (
            <>
              <DialogHeader>
                <DialogTitle className="capitalize">
                  {format(voteDialog.day, "EEEE, dd/MM/yyyy", { locale: vi })}
                </DialogTitle>
                <DialogDescription>
                  {voteDialog.votes.length} người ·{" "}
                  {voteDialog.votes.reduce((s, v) => s + 1 + v.guestCount, 0)} suất
                </DialogDescription>
              </DialogHeader>
              <DayPanel
                key={voteDialog.day.toISOString()}
                day={voteDialog.day}
                playerId={user?.id ?? ""}
                dayVotes={voteDialog.votes}
                onDone={() => voteDialog.setOpen(false)}
              />
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Detail dialog (from the "Chi tiết" button). */}
      <Dialog open={detailDialog.open} onOpenChange={detailDialog.setOpen}>
        <DialogContent>
          {detailDialog.day ? (
            <>
              <DialogHeader>
                <DialogTitle className="capitalize">
                  {format(detailDialog.day, "EEEE, dd/MM/yyyy", { locale: vi })}
                </DialogTitle>
                <DialogDescription>Danh sách người đã vote</DialogDescription>
              </DialogHeader>
              <VoterRows votes={detailDialog.votes} />
              {user ? (
                <DayMatchReport
                  dayVotes={detailDialog.votes}
                  playerId={user.id}
                />
              ) : null}
              <CreateMatchButton
                day={detailDialog.day}
                dayVotes={detailDialog.votes}
                onDone={() => detailDialog.setOpen(false)}
              />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// useSearchParams needs a Suspense boundary during prerender.
const SchedulePage = () => (
  <Suspense fallback={null}>
    <ScheduleContent />
  </Suspense>
);

export default SchedulePage;
