"use client";

import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isValid,
  parse,
  startOfWeek,
} from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useAuth } from "@/contexts";
import { SCHEDULE } from "@/constants/schedule";
import { useScheduleDays } from "../use-schedule-days";

const WEEK_PARAM = "week";
const WEEK_FORMAT = "yyyy-MM-dd";
const startOfWeekOpts = { weekStartsOn: SCHEDULE.WEEK_STARTS_ON } as const;

// Week view wiring: the selected week (URL-backed, ?week=yyyy-MM-dd = the week's
// Monday), its 7 days, and the shared day data. Defaults to the current week.
export const useScheduleWeek = () => {
  const { isReady } = useAuth();
  const now = useMemo(() => new Date(), []);

  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const weekParam = sp.get(WEEK_PARAM);
  const weekStart = useMemo(() => {
    if (weekParam) {
      const parsed = parse(weekParam, WEEK_FORMAT, now);
      if (isValid(parsed)) return startOfWeek(parsed, startOfWeekOpts);
    }
    return startOfWeek(now, startOfWeekOpts);
  }, [weekParam, now]);

  const weekEnd = useMemo(
    () => endOfWeek(weekStart, startOfWeekOpts),
    [weekStart],
  );

  const setWeek = useCallback(
    (next: Date) => {
      const params = new URLSearchParams(sp.toString());
      params.set(WEEK_PARAM, format(startOfWeek(next, startOfWeekOpts), WEEK_FORMAT));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [sp, router, pathname],
  );

  const weekDays = useMemo(
    () => eachDayOfInterval({ start: weekStart, end: weekEnd }),
    [weekStart, weekEnd],
  );

  const days = useScheduleDays(weekStart, weekEnd);

  // Fast dayKey → highlights / votes lookups for the day cards.
  const votableSet = useMemo(
    () => new Set(days.votableDays.map((d) => format(d, WEEK_FORMAT))),
    [days.votableDays],
  );
  const votedSet = useMemo(
    () => new Set(days.votedDays.map((d) => format(d, WEEK_FORMAT))),
    [days.votedDays],
  );
  const matchSet = useMemo(
    () => new Set(days.matchDays.map((d) => format(d, WEEK_FORMAT))),
    [days.matchDays],
  );

  return {
    ...days,
    isReady,
    weekStart,
    weekEnd,
    weekDays,
    setWeek,
    now,
    lookup: { votableSet, votedSet, matchSet },
  };
};
