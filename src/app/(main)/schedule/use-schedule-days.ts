"use client";

import { eachDayOfInterval } from "date-fns";
import { useCallback, useMemo, useState } from "react";
import { isVotableDate } from "@/constants/schedule";
import { useAuth } from "@/contexts";
import { useMatches, useMatchVotes } from "@/hooks/schedule";
import type { MatchVoteModel } from "@/types";
import {
  dayKey,
  matchHighlights,
  type DayHighlights,
} from "./_components/utils";

// Shared data + dialog wiring for any schedule view over a [start, end] range
// (the month grid or a single week). Fetches the votes + matches for the span,
// derives the per-day maps/modifiers, and owns the vote / detail dialog state.
export const useScheduleDays = (start: Date, end: Date) => {
  const { user } = useAuth();
  const now = useMemo(() => new Date(), []);

  const votesQuery = useMatchVotes({
    startVoteDateAt: start.toISOString(),
    endVoteDateAt: end.toISOString(),
    pageSize: 500,
    populations: ["player"],
  });
  const votes = useMemo(() => votesQuery.data?.items ?? [], [votesQuery.data]);

  // Confirmed matches in range — carries goals/assists + MVP for the headlines.
  const matchesQuery = useMatches({
    startMatchDateAt: start.toISOString(),
    endMatchDateAt: end.toISOString(),
    pageSize: 100,
    populations: ["players"],
  });
  const matches = useMemo(
    () => matchesQuery.data?.items ?? [],
    [matchesQuery.data],
  );

  const votesByDay = useMemo(() => {
    const map = new Map<string, MatchVoteModel[]>();
    for (const v of votes) {
      const key = dayKey(new Date(v.voteDate));
      const list = map.get(key);
      if (list) list.push(v);
      else map.set(key, [v]);
    }
    return map;
  }, [votes]);

  const votedDays = useMemo(
    () =>
      votes
        .filter((v) => v.playerId === user?.id)
        .map((v) => new Date(v.voteDate)),
    [votes, user?.id],
  );
  const matchDays = useMemo(
    () => votes.filter((v) => v.matchId).map((v) => new Date(v.voteDate)),
    [votes],
  );

  // Days in range still votable (inside the window & unlocked), excluding days I
  // already voted / that are locked into a match so the "có thể vote" tint never
  // fights those states.
  const votableDays = useMemo(() => {
    const votedKeys = new Set(votedDays.map((d) => dayKey(d)));
    const matchKeys = new Set(matchDays.map((d) => dayKey(d)));
    return eachDayOfInterval({ start, end }).filter(
      (d) =>
        isVotableDate(d, now) &&
        !votedKeys.has(dayKey(d)) &&
        !matchKeys.has(dayKey(d)),
    );
  }, [start, end, now, votedDays, matchDays]);

  // playerId → short display name, borrowed from the (populated) votes.
  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of votes) {
      const p = v.player;
      const short =
        p?.nickname?.trim() ||
        p?.fullName?.trim().split(/\s+/).pop() ||
        p?.username ||
        v.playerId;
      map.set(v.playerId, short);
    }
    return map;
  }, [votes]);

  const highlightsByDay = useMemo(() => {
    const nameOf = (id: string) => nameById.get(id) ?? "?";
    const map = new Map<string, DayHighlights>();
    for (const m of matches)
      map.set(dayKey(new Date(m.matchDate)), matchHighlights(m, nameOf));
    return map;
  }, [matches, nameById]);

  const [voteDay, setVoteDay] = useState<Date | undefined>(undefined);
  const [voteOpen, setVoteOpen] = useState(false);
  const [detailDay, setDetailDay] = useState<Date | undefined>(undefined);
  const [detailOpen, setDetailOpen] = useState(false);

  const onVote = useCallback((d: Date) => {
    setVoteDay(d);
    setVoteOpen(true);
  }, []);
  const onDetail = useCallback((d: Date) => {
    setDetailDay(d);
    setDetailOpen(true);
  }, []);
  const canVoteOn = useCallback((d: Date) => isVotableDate(d, now), [now]);

  // Base click: votable day → vote dialog; otherwise → detail dialog.
  const onDaySelect = useCallback(
    (d?: Date) => {
      if (!d) return;
      if (isVotableDate(d, now)) onVote(d);
      else onDetail(d);
    },
    [now, onVote, onDetail],
  );

  const voteDayVotes = voteDay ? (votesByDay.get(dayKey(voteDay)) ?? []) : [];
  const detailDayVotes = detailDay
    ? (votesByDay.get(dayKey(detailDay)) ?? [])
    : [];

  return {
    now,
    user,
    isLoading: votesQuery.isLoading,
    votesByDay,
    votedDays,
    matchDays,
    votableDays,
    highlightsByDay,
    canVoteOn,
    onVote,
    onDetail,
    onDaySelect,
    voteDialog: {
      open: voteOpen,
      setOpen: setVoteOpen,
      day: voteDay,
      votes: voteDayVotes,
    },
    detailDialog: {
      open: detailOpen,
      setOpen: setDetailOpen,
      day: detailDay,
      votes: detailDayVotes,
    },
  };
};
