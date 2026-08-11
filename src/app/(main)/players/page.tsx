"use client";

import { Search, Users, X } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { SquadCard } from "@/components/player/squad-card";
import { POSITION_CATEGORY_META } from "@/lib/player-meta";
import { usePlayersPage, type TeamGroup } from "./hook";

const ALL = "__all__";

// Position lines for the filter (Thủ môn / Hậu vệ / Tiền vệ / Tiền đạo).
const POSITION_FILTER_OPTIONS = (["GK", "DF", "MD", "FW"] as const).map((c) => ({
  value: c,
  label: POSITION_CATEGORY_META[c].label,
}));

const PlayersContent = () => {
  const s = usePlayersPage();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Cầu thủ</h1>
        <p className="text-muted-foreground">
          Toàn bộ cầu thủ theo đội. Lọc để tìm nhanh.
        </p>
      </div>

      {/* ── Filters (all client-side) ───────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={s.filters.name}
            onChange={(e) => s.setFilter("name", e.target.value)}
            placeholder="Tìm theo tên…"
            className="pl-8"
          />
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={s.filters.nickname}
            onChange={(e) => s.setFilter("nickname", e.target.value)}
            placeholder="Tìm theo biệt danh…"
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

        <Select
          value={s.filters.position || ALL}
          onValueChange={(v) => s.setFilter("position", v === ALL ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Vị trí" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tất cả vị trí</SelectItem>
            {POSITION_FILTER_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      ) : s.players.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <Users className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">
            Không tìm thấy cầu thủ phù hợp.
          </p>
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
  <section className="flex flex-col gap-4">
    <div className="flex items-baseline gap-2 border-l-2 border-primary pl-3">
      <h2 className="text-lg font-semibold uppercase">{team.name}</h2>
      <span className="text-sm text-muted-foreground">
        {team.players.length} cầu thủ
      </span>
    </div>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {team.players.map((p) => (
        <SquadCard key={p.id} player={p} />
      ))}
    </div>
  </section>
);
