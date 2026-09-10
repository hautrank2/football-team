"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { SCHEDULE_LIMITS } from "@/constants/schedule";
import { usePlayers } from "@/hooks";
import { useCreateMatch } from "@/hooks/schedule";
import type { QuickMatchFormProps } from "./type";

export type UseQuickMatchFormProps = QuickMatchFormProps;

const errMsg = (e: unknown) =>
  String((e as { message?: unknown })?.message ?? "Lỗi");

const clampGuest = (n: number) =>
  Math.max(0, Math.min(SCHEDULE_LIMITS.GUEST_MAX, Math.trunc(n) || 0));

export const useQuickMatchForm = ({ onSuccess }: UseQuickMatchFormProps) => {
  const [matchDate, setMatchDate] = useState(""); // yyyy-MM-dd
  const [location, setLocation] = useState("");
  const [keyword, setKeyword] = useState("");
  // playerId → guest count. A Map keeps pick order and the count together.
  const [picked, setPicked] = useState<Map<string, number>>(new Map());

  const playersQuery = usePlayers({ page: 1, pageSize: 500 });
  const players = useMemo(
    () => playersQuery.data?.items ?? [],
    [playersQuery.data],
  );

  const options = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return players;
    return players.filter((p) =>
      [p.fullName, p.nickname, p.username].some((v) =>
        v?.toLowerCase().includes(kw),
      ),
    );
  }, [players, keyword]);

  const togglePlayer = useCallback((playerId: string, on: boolean) => {
    setPicked((prev) => {
      const next = new Map(prev);
      if (on) next.set(playerId, next.get(playerId) ?? 0);
      else next.delete(playerId);
      return next;
    });
  }, []);

  // Guest count is only meaningful for a picked player — ignore otherwise.
  const setGuestCount = useCallback((playerId: string, value: number) => {
    setPicked((prev) => {
      if (!prev.has(playerId)) return prev;
      const next = new Map(prev);
      next.set(playerId, clampGuest(value));
      return next;
    });
  }, []);

  // Select/deselect only what the current search shows, so a filtered list
  // can't silently wipe picks made under another keyword.
  const toggleVisible = useCallback(
    (on: boolean) =>
      setPicked((prev) => {
        const next = new Map(prev);
        for (const p of options) {
          if (on) {
            if (!next.has(p.id)) next.set(p.id, 0);
          } else next.delete(p.id);
        }
        return next;
      }),
    [options],
  );

  const allVisiblePicked =
    options.length > 0 && options.every((p) => picked.has(p.id));

  // Suất = mỗi người + khách của họ (đơn vị chia tiền sân).
  const totalHeads = useMemo(
    () => [...picked.values()].reduce((sum, guests) => sum + 1 + guests, 0),
    [picked],
  );

  const create = useCreateMatch();
  const isPending = create.isPending;
  const canSubmit = !!matchDate && picked.size > 0 && !isPending;

  const submit = useCallback(() => {
    if (!canSubmit) return;
    create.mutate(
      {
        matchDate,
        location: location.trim() || undefined,
        players: [...picked].map(([playerId, guestCount]) => ({
          playerId,
          guestCount,
        })),
      },
      {
        onSuccess: (match) => {
          toast.success("Đã tạo trận đấu");
          onSuccess(match.id);
        },
        onError: (e) => toast.error(errMsg(e)),
      },
    );
  }, [canSubmit, create, matchDate, location, picked, onSuccess]);

  return {
    matchDate,
    setMatchDate,
    location,
    setLocation,
    keyword,
    setKeyword,
    options,
    isLoadingPlayers: playersQuery.isLoading,
    picked,
    togglePlayer,
    setGuestCount,
    toggleVisible,
    allVisiblePicked,
    totalHeads,
    canSubmit,
    isPending,
    submit,
  };
};
