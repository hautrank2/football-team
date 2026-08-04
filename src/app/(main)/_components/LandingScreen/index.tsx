"use client";

import { ArrowRight, ShieldHalf, Sparkles, Trophy, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { playerTitleLabel } from "@/lib/player-meta";
import type { PlayerModel } from "@/types";
import { useLandingScreen } from "./hook";

const HERO_IMAGE = "/images/football_wallpaper.jpg";

export const LandingScreen = () => {
  const s = useLandingScreen();

  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative -mt-16 flex min-h-screen items-center overflow-hidden">
        {/* Background wallpaper + overlays */}
        <div className="absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMAGE}
            alt="Football stadium"
            className="size-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/30 to-transparent" />
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 pt-16 lg:px-16">
          <div className="max-w-2xl">
            <Badge
              variant="outline"
              className="mb-6 gap-1.5 border-primary/40 bg-primary/10 text-primary backdrop-blur"
            >
              <Sparkles className="size-3.5" />
              Đội bóng của chúng tôi
            </Badge>

            <Typography
              variant="h1"
              className="text-5xl uppercase leading-[1.05] sm:text-6xl lg:text-7xl"
            >
              Nơi những
              <span className="text-primary"> huyền thoại </span>
              sân phủi hội tụ
            </Typography>

            <Typography className="mt-6 max-w-xl text-lg text-foreground/80">
              Gặp gỡ đội hình, khám phá danh xưng và chỉ số của từng cầu thủ.
              Một tập thể máu lửa, kỷ luật và không bao giờ bỏ cuộc.
            </Typography>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="gap-2" asChild>
                <a href="#squad">
                  Xem đội hình
                  <ArrowRight className="size-4" />
                </a>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 flex flex-wrap gap-8">
              <Stat
                icon={Users}
                value={s.isLoading ? "—" : String(s.total)}
                label="Cầu thủ"
              />
              <Stat
                icon={ShieldHalf}
                value={s.isLoading ? "—" : String(s.teamCount || 1)}
                label="Đội"
              />
              <Stat
                icon={Trophy}
                value={s.isLoading || !s.topRating ? "—" : String(s.topRating)}
                label="Chỉ số cao nhất"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Squad ────────────────────────────────────────────── */}
      <section id="squad" className="mx-auto w-full max-w-6xl px-4 py-20 lg:px-16">
        <div className="mb-10 flex flex-col gap-2">
          <Typography variant="h2" className="text-4xl uppercase">
            Đội hình
          </Typography>
          <Typography className="text-muted-foreground">
            Toàn bộ cầu thủ trong đội, sắp xếp theo số áo.
          </Typography>
        </div>

        {s.isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-xl" />
            ))}
          </div>
        ) : s.players.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
            Chưa có cầu thủ nào
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {s.players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

// ── Sub-components ──────────────────────────────────────────

const Stat = ({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Users;
  value: string;
  label: string;
}) => (
  <div className="flex items-center gap-3">
    <div className="flex size-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
      <Icon className="size-5" />
    </div>
    <div>
      <div className="text-2xl font-semibold leading-none">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  </div>
);

const PlayerCard = ({ player }: { player: PlayerModel }) => {
  const avatar = player.avatarNoBg || player.avatarUrl || undefined;

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card transition-colors hover:border-primary/50">
      {/* Portrait */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-primary/15 to-transparent">
        {player.jerseyNumber != null ? (
          <span className="absolute right-3 top-2 z-10 text-4xl font-bold text-foreground/15">
            {player.jerseyNumber}
          </span>
        ) : null}
        <Avatar className="size-full rounded-none">
          <AvatarImage
            src={avatar}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <AvatarFallback className="rounded-none text-4xl">
            {player.fullName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        {player.attribute?.overall ? (
          <div className="absolute left-3 top-2 flex flex-col items-center rounded-md bg-primary px-2 py-0.5 text-primary-foreground">
            <span className="text-lg font-bold leading-none">
              {player.attribute.overall}
            </span>
            <span className="text-[10px] uppercase leading-none tracking-wide">
              OVR
            </span>
          </div>
        ) : null}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 p-3">
        <div className="truncate font-semibold uppercase" title={player.fullName}>
          {player.fullName}
        </div>
        {player.nickname ? (
          <div className="truncate text-sm text-muted-foreground">
            "{player.nickname}"
          </div>
        ) : null}
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className="font-normal">
            {playerTitleLabel(player.title)}
          </Badge>
          {player.team?.name ? (
            <Badge variant="outline" className="font-normal">
              {player.team.shortName || player.team.name}
            </Badge>
          ) : null}
        </div>
      </div>
    </div>
  );
};
