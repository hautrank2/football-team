"use client";

import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { LayoutGrid, LogIn, Plus, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { sizeLabel } from "@/lib/lineup-meta";
import type { LineupModel } from "@/types";
import { useLineupsPage } from "./hook";

const LineupsPage = () => {
  const s = useLineupsPage();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Đội hình</h1>
          <p className="text-muted-foreground">Khám phá các đội hình được chia sẻ công khai.</p>
        </div>
        {s.user ? (
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/lineup">
                <LayoutGrid className="size-4" />
                Đội hình của tôi
              </Link>
            </Button>
            <Button asChild>
              <Link href="/lineup/new">
                <Plus className="size-4" />
                Tạo đội hình
              </Link>
            </Button>
          </div>
        ) : (
          <Button asChild>
            <Link href="/login">
              <LogIn className="size-4" />
              Đăng nhập để tạo
            </Link>
          </Button>
        )}
      </div>

      {s.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : s.lineups.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <Users className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">Chưa có đội hình công khai nào.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {s.lineups.map((lineup) => (
            <PublicLineupCard key={lineup.id} lineup={lineup} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LineupsPage;

const PublicLineupCard = ({ lineup }: { lineup: LineupModel }) => (
  <Link href={`/lineups/${lineup.id}`} className="group">
    <Card className="flex h-full flex-col transition-colors group-hover:border-primary/50">
      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-2 text-base">{lineup.name}</CardTitle>
        {lineup.owner ? (
          <span className="text-xs text-muted-foreground">bởi {lineup.owner.fullName}</span>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-end gap-2 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{sizeLabel(lineup.size)}</Badge>
          <Badge variant="outline">{lineup.formation}</Badge>
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {lineup.slots.length}
          </span>
        </div>
        <span className="text-xs">
          Cập nhật {formatDistanceToNow(new Date(lineup.updatedAt), { addSuffix: true, locale: vi })}
        </span>
      </CardContent>
    </Card>
  </Link>
);
