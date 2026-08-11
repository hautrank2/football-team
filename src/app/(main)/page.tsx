"use client";

import { ArrowRight, ShieldHalf, Sparkles, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { PlayerPortrait } from "@/components/player/player-portrait";
import { SquadCard } from "@/components/player/squad-card";
import { cardAccent } from "@/lib/player-card-theme";
import { cn } from "@/lib/utils";
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
          {/* Lighter wash on light mode (image shows through more); heavier on
              dark mode for text legibility. */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/40 to-transparent dark:from-background dark:via-background/70 dark:to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/20 to-transparent dark:from-background/90 dark:via-background/30 dark:to-transparent" />
        </div>

        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-4 pt-16 lg:grid-cols-2 lg:px-16">
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
            </div>
          </div>

          {/* Featured cutout — a background-removed player floating over the
              wallpaper. Only shown when someone actually has an avatarNoBg. */}
          {s.featured ? <HeroFeature player={s.featured} /> : null}
        </div>
      </section>

      {/* ── Teams (roster of clubs) ──────────────────────────── */}
      <section id="teams" className="mx-auto w-full max-w-6xl px-4 pt-20 lg:px-16">
        <div className="mb-10 flex flex-col gap-2">
          <Typography variant="h2" className="text-4xl uppercase">
            Các đội
          </Typography>
          <Typography className="text-muted-foreground">
            Danh sách các đội trong câu lạc bộ. Bấm vào một đội để xem cầu thủ.
          </Typography>
        </div>

        {s.isLoadingTeams ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : s.teamList.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
            Chưa có đội nào
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {s.teamList.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
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

const HeroFeature = ({ player }: { player: PlayerModel }) => {
  const accent = cardAccent(player.positions);
  const ovr = player.attribute?.overall;

  return (
    <div className="relative mx-auto hidden aspect-[3/4] w-full max-w-sm lg:block">
      {/* Coloured halo behind the cutout */}
      <div
        className={cn(
          "absolute left-1/2 top-1/4 size-72 -translate-x-1/2 rounded-full blur-3xl",
          accent.halo,
        )}
      />
      <PlayerPortrait
        player={player}
        className="absolute inset-0"
        imgClassName="drop-shadow-[0_25px_45px_rgba(0,0,0,0.5)]"
      />
      {/* Floating name plate */}
      <div className="absolute inset-x-4 bottom-2 flex items-center gap-3 rounded-2xl border bg-card/70 p-3 backdrop-blur-md">
        {ovr ? (
          <div className="flex flex-col items-center rounded-xl bg-primary px-3 py-1 text-primary-foreground">
            <span className="text-2xl font-black leading-none">{ovr}</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest">OVR</span>
          </div>
        ) : null}
        <div className="min-w-0">
          <div className="truncate font-bold uppercase">{player.fullName}</div>
          {player.nickname ? (
            <div className={cn("truncate text-sm font-medium", accent.text)}>
              {`"${player.nickname}"`}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

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

type TeamListItem = {
  id: string;
  name: string;
  shortName: string | null;
  description: string | null;
  playerCount: number;
};

const TeamCard = ({ team }: { team: TeamListItem }) => {
  // Only teams that actually have players have a squad row to scroll to.
  const linkable = team.playerCount > 0;
  const Wrapper = linkable ? "a" : "div";

  return (
    <Wrapper
      {...(linkable ? { href: `#team-${team.id}` } : {})}
      className={cn(
        "group flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors",
        linkable && "hover:border-primary/50"
      )}
    >
    <div className="flex items-center gap-3">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
        <ShieldHalf className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold uppercase" title={team.name}>
          {team.name}
        </div>
        {team.shortName ? (
          <div className="truncate text-sm text-muted-foreground">{team.shortName}</div>
        ) : null}
      </div>
      <Badge variant="secondary" className="shrink-0 gap-1 font-normal">
        <Users className="size-3" />
        {team.playerCount}
      </Badge>
    </div>
      {team.description ? (
        <p className="line-clamp-2 text-sm text-muted-foreground">{team.description}</p>
      ) : null}
    </Wrapper>
  );
};

type TeamGroup = {
  id: string;
  name: string;
  shortName: string | null;
  players: PlayerModel[];
};

const TeamRow = ({ team, canEdit }: { team: TeamGroup; canEdit?: boolean }) => (
  <div id={`team-${team.id}`} className="flex scroll-mt-24 flex-col gap-4">
    <div className="flex items-baseline gap-3 border-l-2 border-primary pl-3">
      <ShieldHalf className="size-5 self-center text-primary" />
      <Typography variant="h3" className="uppercase">
        {team.name}
      </Typography>
      <span className="text-sm text-muted-foreground">{team.players.length} cầu thủ</span>
    </div>

    {/* One horizontal row per team */}
    <div className="scrollbar-slim -mx-4 flex gap-4 overflow-x-auto px-4 pb-3 pt-1 lg:-mx-16 lg:px-16">
      {team.players.map((player) => (
        <div key={player.id} className="w-44 shrink-0 sm:w-48">
          <SquadCard player={player} canEdit={canEdit} />
        </div>
      ))}
    </div>
  </div>
);
