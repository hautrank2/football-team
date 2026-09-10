"use client";

import type { ReactNode } from "react";
import { PlayerPortrait } from "@/components/player/player-portrait";
import { cardAccent, type CardAccent } from "@/lib/player-card-theme";
import { cn } from "@/lib/utils";
import type { PlayerModel } from "@/types";

// The "stage" every stylized player card is built on: a position-tinted
// gradient, a soft halo behind the head, the jersey number ghosted top-right,
// the cutout standing on the floor, and a fade so whatever sits below stays
// readable. Extracted so the home/squad card and the match participant card are
// literally the same picture. Overlays (OVR chip, badges…) go in `children`.
export const PlayerStage = ({
  player,
  className,
  imgClassName,
  preview,
  accent: accentOverride,
  children,
}: {
  player: PlayerModel;
  className?: string;
  imgClassName?: string;
  preview?: boolean;
  // Paint the stage in something other than the player's tactical line — the
  // MVP card uses gold regardless of where they play.
  accent?: CardAccent;
  children?: ReactNode;
}) => {
  const accent = accentOverride ?? cardAccent(player.positions);

  return (
    <div className={cn("relative aspect-[3/4] overflow-hidden", className)}>
      <div className={cn("absolute inset-0 bg-gradient-to-b", accent.stage)} />
      {/* Soft halo behind the head */}
      <div
        className={cn(
          "absolute left-1/2 top-6 size-28 -translate-x-1/2 rounded-full blur-2xl",
          accent.halo,
        )}
      />
      {/* Jersey number — pinned to the top-right over open stage (the portrait
          sits object-bottom) so it reads clearly without fighting the face. */}
      {player.jerseyNumber != null ? (
        <span className="pointer-events-none absolute right-4 top-0 select-none text-[5rem] font-black italic leading-none text-foreground/25">
          {player.jerseyNumber}
        </span>
      ) : null}

      <PlayerPortrait
        player={player}
        preview={preview}
        className="absolute inset-0"
        imgClassName={imgClassName}
      />

      {/* Fade so the name area reads regardless of the photo */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-card to-transparent" />

      {children}
    </div>
  );
};
