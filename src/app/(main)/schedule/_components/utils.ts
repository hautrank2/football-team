import { format } from "date-fns";
import type { MatchModel, MatchVoteModel } from "@/types";

export const errMsg = (e: unknown) =>
  String((e as { message?: unknown })?.message ?? "Lỗi");

export const dayKey = (d: Date) => format(d, "yyyy-MM-dd");

export const voterName = (v: MatchVoteModel) =>
  v.player?.fullName ?? v.player?.username ?? "Ẩn danh";

// Per-match headline shown right on the calendar cell + in the day dialog.
export type DayHighlights = {
  mvp: string[]; // display names (ties → several)
  topScorer?: { name: string; value: number };
  topAssist?: { name: string; value: number };
};

// Compute the MVP / top scorer / top assister of a match. Names are resolved via
// `nameOf` because the match-list API returns participants without the nested
// player (we borrow the names from the votes, which are populated).
export const matchHighlights = (
  match: MatchModel,
  nameOf: (playerId: string) => string,
): DayHighlights => {
  const players = match.players ?? [];
  const best = (key: "goals" | "assists") =>
    players.reduce<{ name: string; value: number } | undefined>((top, p) => {
      const value = p[key];
      if (value > 0 && (!top || value > top.value))
        return { name: nameOf(p.playerId), value };
      return top;
    }, undefined);
  return {
    mvp: (match.mvpPlayerIds ?? []).map(nameOf),
    topScorer: best("goals"),
    topAssist: best("assists"),
  };
};
