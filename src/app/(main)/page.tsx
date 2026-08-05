"use client";

import { ArrowRight, Pencil, ShieldHalf, Sparkles, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { playerTitleLabel } from "@/lib/player-meta";
import type { PlayerModel } from "@/types";
import { useHomePage } from "./hook";

const HERO_IMAGE = "/images/football_wallpaper.jpg";

const HomePage = () => {
  const s = useHomePage();

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
              Gặp gỡ đội hình, khám phá danh xưng và chỉ số của từng cầu thủ. Một tập thể máu lửa,
              kỷ luật và không bao giờ bỏ cuộc.
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
              <Stat icon={Users} value={s.isLoading ? "—" : String(s.total)} label="Cầu thủ" />
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

      {/* ── Squad (grouped by team, one row per team) ────────── */}
      <section id="squad" className="mx-auto w-full max-w-6xl px-4 py-20 lg:px-16">
        <div className="mb-10 flex flex-col gap-2">
          <Typography variant="h2" className="text-4xl uppercase">
            Đội hình
          </Typography>
          <Typography className="text-muted-foreground">
            Các cầu thủ được nhóm theo đội. Bấm vào một cầu thủ để xem chi tiết.
          </Typography>
        </div>

        {s.isLoading ? (
          <div className="flex flex-col gap-10">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="h-6 w-40" />
                <div className="flex gap-4 overflow-hidden">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Skeleton key={j} className="h-72 w-48 shrink-0 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : s.players.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
            Chưa có cầu thủ nào
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {s.teams.map((team) => (
              <TeamRow key={team.id} team={team} canEdit={s.canEdit} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;

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

type TeamGroup = {
  id: string;
  name: string;
  shortName: string | null;
  players: PlayerModel[];
};

const TeamRow = ({ team, canEdit }: { team: TeamGroup; canEdit?: boolean }) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-baseline gap-3 border-l-2 border-primary pl-3">
      <ShieldHalf className="size-5 self-center text-primary" />
      <Typography variant="h3" className="uppercase">
        {team.name}
      </Typography>
      <span className="text-sm text-muted-foreground">{team.players.length} cầu thủ</span>
    </div>

    {/* One horizontal row per team */}
    <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 lg:-mx-16 lg:px-16">
      {team.players.map((player) => (
        <PlayerCard key={player.id} player={player} canEdit={canEdit} />
      ))}
    </div>
  </div>
);

const PlayerCard = ({ player, canEdit }: { player: PlayerModel; canEdit?: boolean }) => {
  const avatar = player.avatarNoBg || player.avatarUrl || undefined;

  return (
    <div className="group relative w-44 shrink-0 sm:w-48">
      {/* Whole card navigates to the player detail page */}
      <Link
        href={`/player/${player.id}`}
        className="block overflow-hidden rounded-xl border bg-card transition-colors hover:border-primary/50"
      >
        {/* Portrait */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-primary/15 to-transparent">
          {player.jerseyNumber != null ? (
            <span className="absolute right-3 top-2 z-10 text-4xl font-bold text-foreground">
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
              <span className="text-lg font-bold leading-none">{player.attribute.overall}</span>
              <span className="text-[10px] uppercase leading-none tracking-wide">OVR</span>
            </div>
          ) : null}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1.5 p-3">
          <div className="truncate font-semibold uppercase" title={player.fullName}>
            {player.fullName}
          </div>
          {player.nickname ? (
            <div className="truncate text-sm text-muted-foreground">{`"${player.nickname}"`}</div>
          ) : null}
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="font-normal">
              {playerTitleLabel(player.title)}
            </Badge>
          </div>
        </div>
      </Link>

      {/* Admin quick-edit — sibling of the card link (not nested) to keep anchors valid */}
      {canEdit ? (
        <Button
          asChild
          size="icon"
          variant="secondary"
          className="absolute right-2 top-2 z-10 size-8 opacity-0 shadow transition-opacity group-hover:opacity-100"
        >
          <Link href={`/admin/players/${player.id}`} aria-label="Cập nhật cầu thủ">
            <Pencil className="size-3.5" />
          </Link>
        </Button>
      ) : null}
    </div>
  );
};
