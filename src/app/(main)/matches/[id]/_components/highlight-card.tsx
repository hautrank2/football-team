"use client";

import { Crown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { PlayerPortrait } from "@/components/player/player-portrait";
import { PlayerStage } from "@/components/player/player-stage";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cardAccent, KING_ACCENT } from "@/lib/player-card-theme";
import { cn } from "@/lib/utils";
import type { PlayerModel } from "@/types";

export type HighlightEntry = { player: PlayerModel; value?: number };

// Gold lettering — a gradient clipped to the glyphs, so a name reads as metal
// rather than as flat yellow text. Light mode needs the darker end of the ramp:
// pale gold on a white card is unreadable.
const GOLD_TEXT =
  "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-800 bg-clip-text text-transparent dark:from-amber-200 dark:via-amber-400 dark:to-amber-600";

// One award card: Vua phá lưới / Vua kiến tạo / MVP.
//
// A lone winner and a tie deserve different pictures, so this renders two:
//   • exactly one  → a hero: full portrait on the stage, the number printed big
//                    beside it. It's a trophy, so let it look like one.
//   • more than one→ a shared-podium list: the stat once in the header (they all
//                    have it), then a compact row per player. A row of identical
//                    hero portraits just gets noisy.
//
// `king` is the MVP's treatment: a metallic gold frame, a gold stage under the
// portrait, gold lettering. It sits in the middle of the row and should outrank
// the two cards beside it at a glance.
//
// `provisional` means the award hasn't been finalized yet — these are whoever is
// leading the ballot right now, and it can still change before the deadline.
export const HighlightCard = ({
  title,
  icon: Icon,
  entries,
  unit,
  king,
  provisional,
}: {
  title: string;
  icon: LucideIcon;
  entries: HighlightEntry[];
  unit?: string;
  king?: boolean;
  provisional?: boolean;
}) => {
  const value = entries[0]?.value;
  const solo = entries.length === 1 ? entries[0] : null;
  const soloAccent = king ? KING_ACCENT : cardAccent(solo?.player.positions);

  return (
    // The gold frame is a 1px gradient underlay showing through the card's edge —
    // a real metallic border rather than a flat amber outline.
    <div
      className={cn(
        "h-full",
        king &&
          "rounded-xl bg-gradient-to-br from-amber-200 via-amber-500 to-amber-700 p-px shadow-lg shadow-amber-500/20",
      )}
    >
      <Card
        className={cn(
          "relative flex h-full flex-col gap-0 overflow-hidden p-0",
          king && "border-transparent",
        )}
      >
        {king ? (
          <>
            {/* Warm ground + a soft glow bleeding in from the top-right corner. */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent" />
            <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-amber-300/20 blur-3xl" />
          </>
        ) : null}

        <div
          className={cn(
            "relative flex items-center gap-2 border-b px-3 py-2.5",
            king &&
              "border-amber-500/30 bg-gradient-to-r from-amber-500/20 to-transparent",
          )}
        >
          <Icon
            className={cn("size-4", king ? "text-amber-500" : "text-primary")}
          />
          <span
            className={cn(
              "text-sm font-semibold",
              king && "tracking-[0.2em] text-amber-600 dark:text-amber-300",
            )}
          >
            {title}
          </span>
          {entries.length ? (
            <span className="ml-auto flex items-center gap-1.5">
              {provisional ? (
                <Badge
                  variant="outline"
                  className="border-dashed text-[10px] text-muted-foreground"
                >
                  Tạm dẫn đầu
                </Badge>
              ) : null}
              {entries.length > 1 ? (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px]",
                    king &&
                      "border-amber-500/50 text-amber-600 dark:text-amber-300",
                  )}
                >
                  {entries.length} đồng hạng
                </Badge>
              ) : null}
            </span>
          ) : null}
        </div>

        {/* ── Nobody yet ─────────────────────────────────── */}
        {entries.length === 0 ? (
          <div className="relative flex flex-1 items-center justify-center px-3 py-8 text-sm text-muted-foreground">
            Chưa có
          </div>
        ) : solo ? (
          /* ── A single winner: hero treatment ──────────── */
          <Link
            href={`/player/${solo.player.id}`}
            className="group relative flex flex-1 items-stretch gap-3 p-3"
          >
            <PlayerStage
              player={solo.player}
              accent={king ? KING_ACCENT : undefined}
              className={cn(
                "w-24 shrink-0 rounded-lg border sm:w-28",
                king && "border-amber-500/40",
              )}
              imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            />
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              {unit && value != null ? (
                <>
                  <span className="text-4xl font-black leading-none tracking-tight">
                    {value}
                  </span>
                  <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {unit}
                  </span>
                </>
              ) : king ? (
                /* The MVP has no number to print — crown the name instead. */
                <span className="mb-2 inline-flex items-center gap-1.5 text-amber-500">
                  <Crown className="size-6" />
                  <span className="text-xs font-bold uppercase tracking-[0.25em]">
                    {provisional ? "Đang dẫn đầu" : "Nhà vua"}
                  </span>
                </span>
              ) : null}
              <span
                className={cn(
                  "truncate font-bold uppercase tracking-tight",
                  king && `text-lg ${GOLD_TEXT}`,
                )}
                title={solo.player.fullName}
              >
                {solo.player.fullName}
              </span>
              {solo.player.nickname ? (
                <span
                  className={cn(
                    "truncate text-sm font-medium",
                    soloAccent.text,
                  )}
                >
                  {`"${solo.player.nickname}"`}
                </span>
              ) : null}
            </div>
          </Link>
        ) : (
          /* ── A tie: shared podium ─────────────────────── */
          <div className="relative flex flex-1 flex-col">
            {unit && value != null ? (
              <div className="flex items-baseline gap-1.5 border-b px-3 py-2">
                <span className="text-2xl font-black leading-none">
                  {value}
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {unit} / người
                </span>
              </div>
            ) : null}
            <div className={cn("divide-y", king && "divide-amber-500/20")}>
              {entries.map(({ player }) => (
                <TieRow key={player.id} player={player} king={king} />
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// One line of a tied award: small tinted thumbnail + name.
const TieRow = ({ player, king }: { player: PlayerModel; king?: boolean }) => {
  const accent = king ? KING_ACCENT : cardAccent(player.positions);
  return (
    <Link
      href={`/player/${player.id}`}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 transition-colors",
        king ? "hover:bg-amber-500/10" : "hover:bg-accent",
      )}
    >
      <div
        className={cn(
          "relative size-9 shrink-0 overflow-hidden rounded-md border",
          king && "border-amber-500/40",
        )}
      >
        <div
          className={cn("absolute inset-0 bg-gradient-to-b", accent.stage)}
        />
        <PlayerPortrait player={player} className="absolute inset-0" />
      </div>
      <div className="min-w-0">
        <div
          className={cn("truncate text-sm font-semibold", king && GOLD_TEXT)}
          title={player.fullName}
        >
          {player.fullName}
        </div>
        {player.nickname ? (
          <div className={cn("truncate text-xs font-medium", accent.text)}>
            {`"${player.nickname}"`}
          </div>
        ) : null}
      </div>
      {king ? (
        <Crown className="ml-auto size-4 shrink-0 text-amber-500" />
      ) : null}
    </Link>
  );
};
