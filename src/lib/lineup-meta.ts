// FE-owned lineup metadata: pitch sizes, formations, and the geometry that turns
// a formation string ("4-4-2") into positioned slots on the pitch. Kept as plain
// data + pure helpers (no @prisma/client runtime, safe for client bundles).

import type { LineupSizeEnum } from "@/types";

export type Option<T extends string = string> = { value: T; label: string };

// Each player may keep at most this many lineups (also enforced server-side).
export const MAX_LINEUPS_PER_OWNER = 5;

// A point on the pitch. x/y are 0-100 percentages (x: left→right, y: top→bottom).
// The pitch is drawn portrait with the attacking goal at the top, own goal at the
// bottom — so the goalkeeper sits near y≈90 and forwards near y≈16.
export type PitchPoint = { x: number; y: number };

export const SIZE_OPTIONS: Option<LineupSizeEnum>[] = [
  { value: "FIVE", label: "Sân 5" },
  { value: "SEVEN", label: "Sân 7" },
  { value: "ELEVEN", label: "Sân 11" },
];

export const SIZE_COUNT: Record<LineupSizeEnum, number> = {
  FIVE: 5,
  SEVEN: 7,
  ELEVEN: 11,
};

export const sizeLabel = (size: LineupSizeEnum): string =>
  SIZE_OPTIONS.find((o) => o.value === size)?.label ?? size;

// Formations are the OUTFIELD lines only (defense → attack); the goalkeeper is
// added automatically. So the total slot count is 1 + sum(parts) === SIZE_COUNT.
export const FORMATIONS: Record<LineupSizeEnum, string[]> = {
  FIVE: ["2-2", "1-2-1", "3-1", "1-3", "2-1-1"],
  SEVEN: ["2-3-1", "3-2-1", "3-1-2", "2-2-2", "1-3-2"],
  ELEVEN: ["4-4-2", "4-3-3", "4-2-3-1", "3-5-2", "3-4-3", "5-3-2", "4-5-1"],
};

export const defaultFormation = (size: LineupSizeEnum): string => FORMATIONS[size][0];

const round = (n: number): number => Math.round(n * 10) / 10;

// Build the ordered slot coordinates for a formation. Slot 0 is always the GK.
// Lines are spread vertically from the defensive band down near the own goal to
// the attacking band near the top; players within a line are spread horizontally.
export const formationSlots = (formation: string): PitchPoint[] => {
  const parts = formation
    .split("-")
    .map((p) => Number(p.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);

  const slots: PitchPoint[] = [{ x: 50, y: 90 }]; // goalkeeper
  if (parts.length === 0) return slots;

  const TOP = 18; // attacking line
  const BOTTOM = 72; // defensive line
  const PAD = 12; // horizontal padding for the widest lines

  parts.forEach((count, lineIndex) => {
    const y =
      parts.length === 1
        ? 45
        : BOTTOM - (lineIndex * (BOTTOM - TOP)) / (parts.length - 1);

    for (let j = 0; j < count; j++) {
      const x = count === 1 ? 50 : PAD + (j * (100 - 2 * PAD)) / (count - 1);
      slots.push({ x: round(x), y: round(y) });
    }
  });

  return slots;
};

// A saved/placed player (shape shared by the Prisma slot model and the builder).
export type PlacedSlot = { playerId: string; x: number; y: number; isCaptain: boolean };
export type BuiltSlot = { x: number; y: number; playerId: string | null; isCaptain: boolean };

// Turn a formation + any already-placed players into the editable slot list. The
// formation provides the empty template; each saved player is matched onto its
// nearest free template position (keeping that player's own coordinates). If more
// players are supplied than the formation has room for, the extras are appended so
// nobody is silently dropped when switching to a smaller formation.
export const buildSlotsFrom = (formation: string, saved?: PlacedSlot[]): BuiltSlot[] => {
  const template: BuiltSlot[] = formationSlots(formation).map((p) => ({
    ...p,
    playerId: null,
    isCaptain: false,
  }));

  if (!saved?.length) return template;

  const used = new Array(template.length).fill(false);
  const extra: BuiltSlot[] = [];

  for (const s of saved) {
    let best = -1;
    let bestD = Infinity;
    template.forEach((t, i) => {
      if (used[i]) return;
      const d = (t.x - s.x) ** 2 + (t.y - s.y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });

    if (best === -1) {
      extra.push({ x: s.x, y: s.y, playerId: s.playerId, isCaptain: s.isCaptain });
    } else {
      used[best] = true;
      template[best] = { x: s.x, y: s.y, playerId: s.playerId, isCaptain: s.isCaptain };
    }
  }

  return [...template, ...extra];
};
