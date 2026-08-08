"use client";

import {
  endOfMonth,
  endOfWeek,
  format,
  isValid,
  parse,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useAuth } from "@/contexts";
import { SCHEDULE } from "@/constants/schedule";
import { makeDayButton } from "./_components/day-cell";
import { useScheduleDays } from "./use-schedule-days";

const MONTH_PARAM = "month";
const MONTH_FORMAT = "yyyy-MM";

// Month calendar wiring: month (URL-backed), the visible grid range, the shared
// day data, and the react-day-picker DayButton. Presentation stays in the page.
export const useScheduleCalendar = () => {
  const { isReady } = useAuth();
  const now = useMemo(() => new Date(), []);

  // Selected month lives in the URL (?month=yyyy-MM) so it's shareable and
  // survives refresh/back. Falls back to the current month.
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const monthParam = sp.get(MONTH_PARAM);
  const month = useMemo(() => {
    if (monthParam) {
      const parsed = parse(monthParam, MONTH_FORMAT, now);
      if (isValid(parsed)) return startOfMonth(parsed);
    }
    return startOfMonth(now);
  }, [monthParam, now]);

  const setMonth = useCallback(
    (next: Date) => {
      const params = new URLSearchParams(sp.toString());
      params.set(MONTH_PARAM, format(next, MONTH_FORMAT));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [sp, router, pathname],
  );

  // The full grid the calendar paints for `month` — leading/trailing days of the
  // adjacent months included (e.g. Aug 2026 → 27/07 … 06/09).
  const gridStart = useMemo(
    () =>
      startOfWeek(startOfMonth(month), {
        weekStartsOn: SCHEDULE.WEEK_STARTS_ON,
      }),
    [month],
  );
  const gridEnd = useMemo(
    () =>
      endOfWeek(endOfMonth(month), { weekStartsOn: SCHEDULE.WEEK_STARTS_ON }),
    [month],
  );

  const days = useScheduleDays(gridStart, gridEnd);

  const components = useMemo(
    () => ({
      DayButton: makeDayButton(
        days.votesByDay,
        days.highlightsByDay,
        days.onVote,
        days.onDetail,
        days.canVoteOn,
      ),
    }),
    [
      days.votesByDay,
      days.highlightsByDay,
      days.onVote,
      days.onDetail,
      days.canVoteOn,
    ],
  );

  return {
    user: days.user,
    isReady,
    isLoading: days.isLoading,
    month,
    setMonth,
    calendar: {
      components,
      votableDays: days.votableDays,
      votedDays: days.votedDays,
      matchDays: days.matchDays,
      selected: days.voteDialog.day,
      onDaySelect: days.onDaySelect,
    },
    voteDialog: days.voteDialog,
    detailDialog: days.detailDialog,
  };
};
