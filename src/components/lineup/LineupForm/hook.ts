"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useCreateLineup, usePlayers, useUpdateLineup } from "@/hooks";
import {
  SIZE_COUNT,
  buildSlotsFrom,
  defaultFormation,
  FORMATIONS,
} from "@/lib/lineup-meta";
import type { LineupCreateDto, LineupSizeEnum, PlayerModel } from "@/types";
import type { LineupFormProps } from "./type";

// Local, mutable representation of one on-pitch position. `playerId` is null when
// the slot is still empty. Coordinates are 0-100 percentages of the pitch.
export type SlotState = {
  x: number;
  y: number;
  playerId: string | null;
  isCaptain: boolean;
};

type DragInfo = {
  from: "bench" | "slot";
  playerId: string;
  slotIndex?: number;
  startX: number;
  startY: number;
};

const schema = z.object({
  name: z.string().min(1, "Nhập tên đội hình"),
  formation: z.string().min(1, "Chọn sơ đồ"),
  note: z.string().optional(),
  isPublic: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);
const SNAP = 13; // % radius within which a drop snaps to a slot

// Re-lay the currently placed players onto a NEW formation, snapping them to the
// new template coordinates. Used when the user switches size/formation — positions
// must follow the new shape rather than staying where they were. Each player keeps
// its slot INDEX where possible (so a striker stays a striker, GK stays GK); any
// player whose index no longer exists (formation shrank) is rescued into the first
// remaining empty slot so nobody is silently dropped.
const remapOnto = (formation: string, old: SlotState[]): SlotState[] => {
  const template = buildSlotsFrom(formation);
  const overflow: SlotState[] = [];

  old.forEach((s, i) => {
    if (!s.playerId) return;
    if (i < template.length) {
      template[i].playerId = s.playerId;
      template[i].isCaptain = s.isCaptain;
    } else {
      overflow.push(s);
    }
  });

  for (const s of overflow) {
    const empty = template.findIndex((t) => !t.playerId);
    if (empty === -1) break;
    template[empty].playerId = s.playerId;
    template[empty].isCaptain = s.isCaptain;
  }

  return template;
};

export const useLineupForm = ({ mode, ownerId, initial }: LineupFormProps) => {
  const router = useRouter();

  const [size, setSize] = useState<LineupSizeEnum>(initial?.size ?? "SEVEN");
  const [slots, setSlots] = useState<SlotState[]>(() =>
    buildSlotsFrom(initial?.formation ?? defaultFormation(initial?.size ?? "SEVEN"), initial?.slots)
  );
  const [search, setSearch] = useState("");
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  // Reactive copy of the current drag origin so the source token can be hidden
  // while it's being dragged (dragRef alone doesn't trigger a re-render).
  const [dragSource, setDragSource] = useState<{
    from: "bench" | "slot";
    playerId: string;
    slotIndex?: number;
  } | null>(null);

  const pitchRef = useRef<HTMLDivElement>(null);
  const slotsRef = useRef(slots);
  slotsRef.current = slots;
  const dragRef = useRef<DragInfo | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? "",
      formation: initial?.formation ?? defaultFormation(initial?.size ?? "SEVEN"),
      note: initial?.note ?? "",
      isPublic: initial?.isPublic ?? true,
    },
  });

  const formation = form.watch("formation");

  // ── Squad (bench source) ──────────────────────────────────────────────
  const playersQuery = usePlayers({ page: 1, pageSize: 200, sortBy: "jerseyNumber", order: "asc" });
  const players = useMemo(() => playersQuery.data?.items ?? [], [playersQuery.data]);
  const playersById = useMemo(() => {
    const map = new Map<string, PlayerModel>();
    players.forEach((p) => map.set(p.id, p));
    return map;
  }, [players]);

  const placedIds = useMemo(
    () => new Set(slots.map((s) => s.playerId).filter(Boolean) as string[]),
    [slots]
  );

  const bench = useMemo(() => {
    const q = search.trim().toLowerCase();
    return players.filter((p) => {
      if (placedIds.has(p.id)) return false;
      if (!q) return true;
      return (
        p.fullName.toLowerCase().includes(q) ||
        (p.nickname?.toLowerCase().includes(q) ?? false) ||
        String(p.jerseyNumber ?? "").includes(q)
      );
    });
  }, [players, placedIds, search]);

  // ── Slot mutations ────────────────────────────────────────────────────
  const assignToSlot = useCallback((idx: number, playerId: string) => {
    setSlots((prev) => {
      const next = prev.map((s) => ({ ...s }));
      // A player can only occupy one slot — vacate any previous one.
      next.forEach((s) => {
        if (s.playerId === playerId) {
          s.playerId = null;
          s.isCaptain = false;
        }
      });
      next[idx].playerId = playerId;
      next[idx].isCaptain = false;
      return next;
    });
  }, []);

  const swapSlots = useCallback((a: number, b: number) => {
    setSlots((prev) => {
      const next = prev.map((s) => ({ ...s }));
      const pa = { playerId: next[a].playerId, isCaptain: next[a].isCaptain };
      next[a].playerId = next[b].playerId;
      next[a].isCaptain = next[b].isCaptain;
      next[b].playerId = pa.playerId;
      next[b].isCaptain = pa.isCaptain;
      return next;
    });
  }, []);

  const moveSlot = useCallback((idx: number, x: number, y: number) => {
    setSlots((prev) => {
      const next = prev.map((s) => ({ ...s }));
      next[idx].x = Math.round(x * 10) / 10;
      next[idx].y = Math.round(y * 10) / 10;
      return next;
    });
  }, []);

  const clearSlot = useCallback((idx: number) => {
    setSlots((prev) => {
      const next = prev.map((s) => ({ ...s }));
      next[idx].playerId = null;
      next[idx].isCaptain = false;
      return next;
    });
  }, []);

  const toggleCaptain = useCallback((idx: number) => {
    setSlots((prev) =>
      prev.map((s, i) => ({ ...s, isCaptain: i === idx ? !prev[idx].isCaptain : false }))
    );
  }, []);

  const assignFirstEmpty = useCallback(
    (playerId: string) => {
      const empty = slotsRef.current.findIndex((s) => !s.playerId);
      if (empty >= 0) assignToSlot(empty, playerId);
      else toast.info("Đội hình đã đủ người");
    },
    [assignToSlot]
  );

  // ── Formation / size changes (keep already-placed players) ─────────────
  const changeFormation = useCallback(
    (f: string) => {
      form.setValue("formation", f, { shouldValidate: true });
      setSlots(remapOnto(f, slotsRef.current));
    },
    [form]
  );

  const changeSize = useCallback(
    (s: LineupSizeEnum) => {
      const f = defaultFormation(s);
      setSize(s);
      form.setValue("formation", f, { shouldValidate: true });
      setSlots(remapOnto(f, slotsRef.current));
    },
    [form]
  );

  // ── Drag & drop (pointer-based, works for mouse + touch) ───────────────
  const startDragBench = useCallback((playerId: string, e: React.PointerEvent) => {
    e.preventDefault();
    dragRef.current = { from: "bench", playerId, startX: e.clientX, startY: e.clientY };
    setGhost({ x: e.clientX, y: e.clientY });
    setDragActive(true);
    setDragSource({ from: "bench", playerId });
  }, []);

  const startDragSlot = useCallback((idx: number, e: React.PointerEvent) => {
    const s = slotsRef.current[idx];
    if (!s.playerId) return;
    e.preventDefault();
    dragRef.current = {
      from: "slot",
      playerId: s.playerId,
      slotIndex: idx,
      startX: e.clientX,
      startY: e.clientY,
    };
    setGhost({ x: e.clientX, y: e.clientY });
    setDragActive(true);
    setDragSource({ from: "slot", playerId: s.playerId, slotIndex: idx });
  }, []);

  useEffect(() => {
    if (!dragActive) return;

    const onMove = (e: PointerEvent) => setGhost({ x: e.clientX, y: e.clientY });

    const onUp = (e: PointerEvent) => {
      const info = dragRef.current;
      dragRef.current = null;
      setGhost(null);
      setDragActive(false);
      setDragSource(null);
      if (!info) return;

      const rect = pitchRef.current?.getBoundingClientRect();
      if (!rect) return;

      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      const relX = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
      const relY = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);

      const current = slotsRef.current;
      let nearest = -1;
      let nd = Infinity;
      current.forEach((s, i) => {
        const d = Math.hypot(s.x - relX, s.y - relY);
        if (d < nd) {
          nd = d;
          nearest = i;
        }
      });

      if (info.from === "bench") {
        if (inside && nearest >= 0 && nd <= SNAP) {
          assignToSlot(nearest, info.playerId);
        } else {
          const moved = Math.hypot(e.clientX - info.startX, e.clientY - info.startY) > 8;
          if (!moved) assignFirstEmpty(info.playerId);
        }
        return;
      }

      // from a slot
      const from = info.slotIndex as number;
      if (!inside) {
        clearSlot(from);
      } else if (nearest >= 0 && nearest !== from && nd <= SNAP) {
        swapSlots(from, nearest);
      } else {
        moveSlot(from, relX, relY);
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragActive, assignToSlot, assignFirstEmpty, clearSlot, swapSlots, moveSlot]);

  const ghostPlayer = ghost && dragRef.current ? playersById.get(dragRef.current.playerId) : undefined;

  // ── Submit ─────────────────────────────────────────────────────────────
  const createMutation = useCreateLineup();
  const updateMutation = useUpdateLineup();

  const onSubmit = form.handleSubmit((values) => {
    const payloadSlots = slotsRef.current
      .filter((s) => s.playerId)
      .map((s) => ({
        playerId: s.playerId as string,
        x: Math.round(s.x),
        y: Math.round(s.y),
        isCaptain: s.isCaptain,
      }));

    const body: LineupCreateDto = {
      ownerId,
      name: values.name.trim(),
      size,
      formation: values.formation,
      note: values.note?.trim() || undefined,
      isPublic: values.isPublic,
      slots: payloadSlots,
    };

    if (mode === "create") {
      createMutation.mutate(body, {
        onSuccess: () => {
          toast.success("Đã tạo đội hình");
          router.push("/lineup");
        },
        onError: (err) => {
          const raw = (err as { message?: unknown })?.message;
          toast.error(typeof raw === "string" ? raw : "Có lỗi xảy ra, vui lòng thử lại");
        },
      });
    } else if (initial) {
      updateMutation.mutate(
        { id: initial.id, body },
        {
          onSuccess: () => {
            toast.success("Đã lưu đội hình");
            router.push("/lineup");
          },
          onError: () => toast.error("Có lỗi xảy ra, vui lòng thử lại"),
        }
      );
    }
  });

  return {
    mode,
    form,
    onSubmit,
    size,
    changeSize,
    formation,
    changeFormation,
    formations: FORMATIONS[size],
    slots,
    playersById,
    bench,
    search,
    setSearch,
    pitchRef,
    startDragBench,
    startDragSlot,
    toggleCaptain,
    clearSlot,
    ghost,
    ghostPlayer,
    dragSource,
    isLoadingPlayers: playersQuery.isPending,
    isSaving: createMutation.isPending || updateMutation.isPending,
    placedCount: placedIds.size,
    totalCount: SIZE_COUNT[size],
  };
};
