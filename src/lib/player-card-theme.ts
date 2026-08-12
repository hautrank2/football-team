// Position-line accents for the stylized player cards / hero. The dominant
// tactical line (GK/DF/MD/FW) colours the "stage" gradient the cutout stands on,
// plus the hover glow and accent text. Falls back to the brand primary when a
// player has no line-mapped position.
import { dominantCategory, type PositionCategory } from "./player-meta";

export type CardAccent = {
  // Gradient behind the cutout (top → bottom), tuned for light + dark.
  stage: string;
  // Coloured shadow revealed on hover.
  glow: string;
  // Accent text / ring colour.
  text: string;
  // Soft radial halo behind the head.
  halo: string;
};

const ACCENTS: Record<PositionCategory | "DEFAULT", CardAccent> = {
  GK: {
    stage: "from-amber-400/35 via-amber-500/10 to-transparent",
    glow: "group-hover:shadow-amber-500/25",
    text: "text-amber-500",
    halo: "bg-amber-400/25",
  },
  DF: {
    stage: "from-blue-500/35 via-blue-500/10 to-transparent",
    glow: "group-hover:shadow-blue-500/25",
    text: "text-blue-500",
    halo: "bg-blue-500/25",
  },
  MD: {
    stage: "from-emerald-500/35 via-emerald-500/10 to-transparent",
    glow: "group-hover:shadow-emerald-500/25",
    text: "text-emerald-500",
    halo: "bg-emerald-500/25",
  },
  FW: {
    stage: "from-red-500/35 via-red-500/10 to-transparent",
    glow: "group-hover:shadow-red-500/25",
    text: "text-red-500",
    halo: "bg-red-500/25",
  },
  // No mapped tactical line (no position, or only "fun" positions) → neutral gray.
  DEFAULT: {
    stage: "from-zinc-400/30 via-zinc-400/10 to-transparent",
    glow: "group-hover:shadow-zinc-500/25",
    text: "text-zinc-500",
    halo: "bg-zinc-400/25",
  },
};

export const cardAccent = (positions?: string[] | null): CardAccent =>
  ACCENTS[dominantCategory(positions) ?? "DEFAULT"];
