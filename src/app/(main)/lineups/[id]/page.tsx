"use client";

import { ArrowLeft, Lock, Pencil, Star } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotFound } from "@/components/ui/pages";
import { LineupPitch } from "@/components/lineup";
import { playerTitleLabel } from "@/lib/player-meta";
import { sizeLabel } from "@/lib/lineup-meta";
import { useLineupViewPage } from "./hook";

const LineupViewPage = () => {
  const s = useLineupViewPage();

  if (s.isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 text-center text-muted-foreground">Đang tải…</div>
    );
  }

  if (s.isError || !s.lineup) {
    return (
      <NotFound
        title="Không tìm thấy đội hình"
        description="Đội hình này không tồn tại hoặc đã bị xóa."
      />
    );
  }

  if (!s.canView) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <Lock className="size-12 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Đội hình riêng tư</h2>
        <p className="text-muted-foreground">Chủ sở hữu chưa chia sẻ công khai đội hình này.</p>
      </div>
    );
  }

  const { lineup } = s;
  const slots = [...lineup.slots].sort((a, b) => Number(b.isCaptain) - Number(a.isCaptain));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/lineups" aria-label="Quay lại">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{lineup.name}</h1>
            {lineup.owner ? (
              <p className="text-sm text-muted-foreground">bởi {lineup.owner.fullName}</p>
            ) : null}
          </div>
        </div>

        {s.isOwner ? (
          <Button asChild variant="outline">
            <Link href={`/lineup/${lineup.id}`}>
              <Pencil className="size-4" />
              Chỉnh sửa
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        {/* Pitch */}
        <div className="mx-auto w-full max-w-md">
          <LineupPitch slots={lineup.slots} playersById={s.playersById} />
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{sizeLabel(lineup.size)}</Badge>
            <Badge variant="outline">{lineup.formation}</Badge>
          </div>

          {lineup.note ? (
            <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
              {lineup.note}
            </div>
          ) : null}

          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold">Danh sách ({slots.length})</h3>
            <ul className="flex flex-col divide-y">
              {slots.map((slot, i) => {
                const player = s.playersById.get(slot.playerId);
                return (
                  <li key={i} className="flex items-center gap-2 py-2 text-sm">
                    {slot.isCaptain ? (
                      <Star className="size-4 shrink-0 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <span className="w-4 shrink-0" />
                    )}
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {player?.fullName ?? "—"}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {player ? playerTitleLabel(player.title) : ""}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineupViewPage;
