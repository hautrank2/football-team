"use client";

import { Search, Users, X } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImagePreview } from "@/components/ui/image-preview";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { playerPositionLabel, playerTitleLabel } from "@/lib/player-meta";
import type { PlayerModel } from "@/types";
import { usePlayersPage, type TeamGroup } from "./hook";

const ALL = "__all__";

const PlayersContent = () => {
  const s = usePlayersPage();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Cầu thủ</h1>
        <p className="text-muted-foreground">Toàn bộ cầu thủ theo đội. Lọc để tìm nhanh.</p>
      </div>

      {/* ── Filters ─────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={s.filters.name}
            onChange={(e) => s.setFilter("name", e.target.value)}
            placeholder="Tìm theo tên…"
            className="pl-8"
          />
        </div>

        <Select
          value={s.filters.teamId || ALL}
          onValueChange={(v) => s.setFilter("team", v === ALL ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Đội" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tất cả đội</SelectItem>
            {s.teams.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{s.total} cầu thủ</span>
        {s.hasFilters ? (
          <Button variant="ghost" size="sm" onClick={s.reset}>
            <X className="size-4" />
            Xóa lọc
          </Button>
        ) : null}
      </div>

      {/* ── Results ─────────────────────────────────────────── */}
      {s.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : s.players.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <Users className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">Không tìm thấy cầu thủ phù hợp.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {s.grouped.map((team) => (
            <TeamSection key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
};

const PlayersPage = () => (
  <Suspense fallback={null}>
    <PlayersContent />
  </Suspense>
);

export default PlayersPage;

// ── Sub-components ────────────────────────────────────────────

const TeamSection = ({ team }: { team: TeamGroup }) => (
  <section className="flex flex-col gap-3">
    <div className="flex items-baseline gap-2 border-l-2 border-primary pl-3">
      <h2 className="text-lg font-semibold uppercase">{team.name}</h2>
      <span className="text-sm text-muted-foreground">{team.players.length} cầu thủ</span>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {team.players.map((p) => (
        <PlayerRow key={p.id} player={p} />
      ))}
    </div>
  </section>
);

const PlayerRow = ({ player }: { player: PlayerModel }) => {
  const avatar = player.avatarNoBg || player.avatarUrl || undefined;
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-primary/50">
      <ImagePreview src={avatar} alt={player.fullName}>
        <Avatar className="size-12 border">
          <AvatarImage src={avatar} className="object-cover" />
          <AvatarFallback>{player.fullName.charAt(0)}</AvatarFallback>
        </Avatar>
      </ImagePreview>

      <Link href={`/player/${player.id}`} className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold">{player.fullName}</span>
          {player.jerseyNumber != null ? (
            <span className="shrink-0 text-sm text-muted-foreground">#{player.jerseyNumber}</span>
          ) : null}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className="font-normal">
            {playerTitleLabel(player.title)}
          </Badge>
          {player.positions?.slice(0, 3).map((pos) => (
            <Badge key={pos} variant="outline" className="font-normal">
              {playerPositionLabel(pos)}
            </Badge>
          ))}
        </div>
      </Link>

      {player.attribute?.overall ? (
        <div className="flex shrink-0 flex-col items-center rounded-lg bg-primary px-2 py-1 text-primary-foreground">
          <span className="text-base font-bold leading-none">{player.attribute.overall}</span>
          <span className="text-[9px] uppercase leading-none">OVR</span>
        </div>
      ) : null}
    </div>
  );
};
