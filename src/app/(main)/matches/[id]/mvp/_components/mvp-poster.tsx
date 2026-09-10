"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Crown, Goal, Handshake, MapPin, Users } from "lucide-react";
import { forwardRef } from "react";
import { playerImageSrc } from "@/components/player/player-portrait";
import { cn } from "@/lib/utils";
import type { MatchModel, MatchPlayerModel, PlayerModel } from "@/types";

// The poster is captured at exactly this size (then exported at 2x → 1080×1440),
// so every measurement inside is fixed px rather than responsive: what you see
// is literally what gets saved.
export const POSTER_W = 540;
export const POSTER_H = 720;

// Photos live on the R2 public domain, which sends no CORS headers — a canvas
// that has drawn one cannot be exported. Routing them through our own origin is
// what makes the PNG export possible at all.
const proxied = (url?: string | null): string | undefined =>
  url ? `/api/image?url=${encodeURIComponent(url)}` : undefined;

const GOLD_TEXT =
  "bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 bg-clip-text text-transparent";

export type MvpPosterProps = {
  match: MatchModel;
  mvps: PlayerModel[];
  /** The MVPs' own line in this match, for the stat tiles. */
  statsOf: (playerId: string) => MatchPlayerModel | undefined;
  topScorers: { player: PlayerModel; value: number }[];
  topAssists: { player: PlayerModel; value: number }[];
  /** Award not finalized yet — these are the current leader(s). */
  provisional?: boolean;
};

// A share-ready poster for a match's MVP: club header, the winner on a gold
// stage, their line for the match, and the other two awards along the bottom.
export const MvpPoster = forwardRef<HTMLDivElement, MvpPosterProps>(
  ({ match, mvps, statsOf, topScorers, topAssists, provisional }, ref) => {
    const solo = mvps.length === 1 ? mvps[0] : null;
    const mine = solo ? statsOf(solo.id) : undefined;
    const heads = (match.players ?? []).reduce(
      (s, p) => s + 1 + p.guestCount,
      0,
    );

    return (
      <div
        ref={ref}
        style={{ width: POSTER_W, height: POSTER_H }}
        className="relative flex flex-col overflow-hidden bg-[#070b18] text-white"
      >
        {/* ── Ground: pitch glow + gold halo ─────────────────── */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(245,158,11,0.20),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(90%_100%_at_50%_100%,rgba(37,99,235,0.22),transparent_70%)]" />
        {/* Faint pitch lines */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #fff 0 1px, transparent 1px 54px)",
          }}
        />

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="relative flex items-center justify-between border-b border-white/10 px-7 py-5">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt=""
              className="size-8 rounded"
              crossOrigin="anonymous"
            />
            <span className="text-xl font-bold uppercase tracking-[0.3em] text-white">
              Footboys
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold capitalize leading-tight">
              {format(new Date(match.matchDate), "EEEE, dd/MM/yyyy", {
                locale: vi,
              })}
            </div>
            <div className="flex items-center justify-end gap-1 text-[11px] text-white/60">
              {format(new Date(match.kickoffAt), "HH:mm")}
              {match.location ? (
                <>
                  <MapPin className="size-3" />
                  {match.location}
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* ── Title ──────────────────────────────────────────── */}
        <div className="relative mt-5 flex flex-col items-center">
          <div className="flex items-center gap-2 text-amber-400">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-amber-400" />
            <Crown className="size-5" />
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-amber-400" />
          </div>
          <div
            className={cn(
              "mt-2 text-2xl font-black uppercase tracking-[0.35em]",
              GOLD_TEXT,
            )}
          >
            MVP
          </div>
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/50">
            {provisional ? "Đang dẫn đầu bình chọn" : "Cầu thủ xuất sắc nhất"}
          </div>
        </div>

        {/* ── Winner(s) ──────────────────────────────────────── */}
        <div className="relative flex flex-1 flex-col items-center justify-center px-7 pb-4 pt-2">
          <div className="flex items-end justify-center gap-4">
            {mvps.slice(0, 3).map((p) => (
              <Portrait key={p.id} player={p} big={!!solo} />
            ))}
          </div>

          <div className="mt-3 text-center">
            <div
              className={cn(
                "font-black uppercase leading-tight tracking-tight",
                solo ? "text-3xl" : "text-2xl",
                GOLD_TEXT,
              )}
            >
              {mvps.map((p) => p.fullName).join(" · ")}
            </div>
            {solo?.nickname ? (
              <div className="mt-0.5 text-lg font-medium text-amber-300/80">
                {`"${solo.nickname}"`}
              </div>
            ) : null}
          </div>

          {/* Stat tiles — the winner's own line, plus the turnout. */}
          <div className="mt-4 flex w-full max-w-[420px] items-stretch justify-center gap-3">
            <Tile
              icon={Goal}
              value={mine ? mine.goals : sum(mvps, statsOf, "goals")}
              label="Bàn thắng"
            />
            <Tile
              icon={Handshake}
              value={mine ? mine.assists : sum(mvps, statsOf, "assists")}
              label="Kiến tạo"
            />
            <Tile icon={Users} value={heads} label="Suất ra sân" />
          </div>
        </div>

        {/* ── Other awards ───────────────────────────────────── */}
        <div className="relative grid grid-cols-2 gap-px border-t border-white/10 bg-white/10">
          <AwardStrip
            icon={Goal}
            title="Vua phá lưới"
            entries={topScorers}
            unit="bàn"
          />
          <AwardStrip
            icon={Handshake}
            title="Vua kiến tạo"
            entries={topAssists}
            unit="kiến tạo"
          />
        </div>
      </div>
    );
  },
);
MvpPoster.displayName = "MvpPoster";

const sum = (
  players: PlayerModel[],
  statsOf: MvpPosterProps["statsOf"],
  key: "goals" | "assists",
): number => players.reduce((s, p) => s + (statsOf(p.id)?.[key] ?? 0), 0);

// The winner on a gold stage: jersey number ghosted behind, cutout standing on
// the floor, gold frame around the whole thing.
const Portrait = ({ player, big }: { player: PlayerModel; big: boolean }) => {
  const src = proxied(playerImageSrc(player));
  const isCutout = !!player.avatarNoBg;

  return (
    <div
      className="relative overflow-hidden rounded-xl"
      style={{
        width: big ? 190 : 124,
        height: big ? 253 : 165,
        padding: 2,
        background:
          "linear-gradient(140deg, #fde68a 0%, #f59e0b 45%, #b45309 100%)",
      }}
    >
      <div className="relative size-full overflow-hidden rounded-[10px] bg-[#0b1020]">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-400/45 via-amber-500/10 to-transparent" />
        <div className="absolute left-1/2 top-6 size-28 -translate-x-1/2 rounded-full bg-amber-300/30 blur-2xl" />
        {player.jerseyNumber != null ? (
          <span
            className="absolute right-2 top-0 select-none font-black italic leading-none text-white/25"
            style={{ fontSize: big ? 76 : 48 }}
          >
            {player.jerseyNumber}
          </span>
        ) : null}
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={player.fullName}
            crossOrigin="anonymous"
            className={cn(
              "absolute inset-0 size-full",
              isCutout
                ? "object-contain object-bottom drop-shadow-[0_12px_20px_rgba(0,0,0,0.45)]"
                : "object-cover",
            )}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-4xl font-bold text-white/40">
            {player.fullName.charAt(0)}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0b1020] to-transparent" />
      </div>
    </div>
  );
};

const Tile = ({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Goal;
  value: number;
  label: string;
}) => (
  <div className="flex flex-1 flex-col items-center rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
    <Icon className="size-4 text-amber-400/80" />
    <div className="mt-1 text-2xl font-black leading-none tabular-nums">
      {value}
    </div>
    <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-white/50">
      {label}
    </div>
  </div>
);

const AwardStrip = ({
  icon: Icon,
  title,
  entries,
  unit,
}: {
  icon: typeof Goal;
  title: string;
  entries: { player: PlayerModel; value: number }[];
  unit: string;
}) => (
  <div className="flex flex-col gap-1 bg-[#070b18] px-6 py-3.5">
    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
      <Icon className="size-3.5" />
      {title}
    </div>
    {entries.length ? (
      <>
        <div className="truncate text-sm font-bold uppercase">
          {entries.map((e) => e.player.fullName).join(", ")}
        </div>
        <div className="text-[11px] font-semibold text-amber-400">
          {entries[0].value} {unit}
        </div>
      </>
    ) : (
      <div className="text-sm text-white/35">—</div>
    )}
  </div>
);
