"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SocialLinks } from "@/components/player/social-links";
import { PlayerPortrait } from "@/components/player/player-portrait";
import { cardAccent } from "@/lib/player-card-theme";
import {
  dominantCategory,
  playerPositionLabel,
  playerTitleLabel,
  POSITION_CATEGORY_META,
} from "@/lib/player-meta";
import { cn } from "@/lib/utils";
import type { PlayerModel } from "@/types";

// Stylized, FUT-inspired player card. The cutout (avatarNoBg) stands on a
// position-tinted stage with the jersey number ghosted behind it and the OVR
// chip pinned to the corner. Shared by the home squad rows and the players
// directory grid so both read as one system.
export const SquadCard = ({
  player,
  canEdit,
}: {
  player: PlayerModel;
  canEdit?: boolean;
}) => {
  const accent = cardAccent(player.positions);
  const cat = dominantCategory(player.positions);
  const catMeta = cat ? POSITION_CATEGORY_META[cat] : null;
  const ovr = player.attribute?.overall;
  const jersey = player.jerseyNumber;

  // Specific positions for the tooltip, minus any that just restate the line
  // label (e.g. DEFENDER → "Hậu vệ" under the "Hậu vệ" line) to avoid repeats.
  const extraPositions = catMeta
    ? (player.positions ?? [])
        .map(playerPositionLabel)
        .filter((l): l is string => !!l && l !== catMeta.label)
    : [];

  return (
    <div
      className={cn(
        "group relative flex size-full flex-col overflow-hidden border bg-card shadow-sm transition-all duration-300",
        "hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl",
        accent.glow,
      )}
    >
      {/* The stage + info is the navigation target. Social icons (anchors) sit in
          a sibling row below it — nesting anchors is invalid HTML — but now share
          the same card frame so they read as part of the card. */}
      <Link href={`/player/${player.id}`} className="block">
        {/* ── Stage ──────────────────────────────────────── */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <div
            className={cn("absolute inset-0 bg-gradient-to-b", accent.stage)}
          />
          {/* Soft halo behind the head */}
          <div
            className={cn(
              "absolute left-1/2 top-6 size-28 -translate-x-1/2 rounded-full blur-2xl",
              accent.halo,
            )}
          />
          {/* Jersey number — pinned to the top-right over open stage (the portrait
              sits object-bottom) so it reads clearly without fighting the face. */}
          {jersey != null ? (
            <span className="pointer-events-none absolute right-4 top-0 select-none text-[5rem] font-black italic leading-none text-foreground/25">
              {jersey}
            </span>
          ) : null}

          <PlayerPortrait
            player={player}
            preview
            className="absolute inset-0"
            imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />

          {/* OVR chip */}
          {ovr ? (
            <div className="absolute left-2.5 top-2.5 flex flex-col items-center rounded-lg bg-primary/95 px-2 py-0.5 text-primary-foreground shadow-md backdrop-blur">
              <span className="text-lg font-black leading-none">{ovr}</span>
              <span className="text-[9px] font-semibold uppercase leading-none tracking-widest">
                OVR
              </span>
            </div>
          ) : null}

          {/* Position line pill — sits under the OVR chip so the top-right stays
              clear for the jersey ghost / admin edit button. Hover reveals the
              full line + specific positions. */}
          {catMeta ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="absolute left-2.5 top-12">
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-transparent font-bold shadow-sm backdrop-blur",
                      catMeta.badge,
                    )}
                  >
                    {catMeta.short}
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="font-semibold">{catMeta.label}</div>
                {extraPositions.length ? (
                  <div className="opacity-80">{extraPositions.join(", ")}</div>
                ) : null}
              </TooltipContent>
            </Tooltip>
          ) : null}

          {/* Fade so the name area reads regardless of the photo */}
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-card to-transparent" />
        </div>

        {/* ── Info ───────────────────────────────────────── */}
        <div className="flex flex-col gap-1 px-3 pb-2 pt-1">
          <div
            className="truncate font-bold uppercase tracking-tight"
            title={player.fullName}
          >
            {player.fullName}
          </div>
          {player.nickname ? (
            <div className={cn("truncate text-sm font-medium", accent.text)}>
              {`"${player.nickname}"`}
            </div>
          ) : null}
          <Badge variant="secondary" className="mt-0.5 w-fit font-normal">
            {playerTitleLabel(player.title)}
          </Badge>
        </div>
      </Link>

      {/* Socials live inside the card, tucked under the info. mt-auto pins them to
          the bottom so cards in a grid keep their footers aligned. */}
      {player.socials?.length ? (
        <div className="mt-auto flex items-center gap-3 px-3 pb-3 pt-0.5">
          <SocialLinks socials={player.socials} />
        </div>
      ) : null}

      {canEdit ? (
        <Button
          asChild
          size="icon"
          variant="secondary"
          className="absolute right-2 top-2 z-10 size-8 opacity-0 shadow transition-opacity group-hover:opacity-100"
        >
          <Link
            href={`/admin/players/${player.id}`}
            aria-label="Cập nhật cầu thủ"
          >
            <Pencil className="size-3.5" />
          </Link>
        </Button>
      ) : null}
    </div>
  );
};
