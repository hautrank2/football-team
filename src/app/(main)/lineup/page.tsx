"use client";

import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Eye, Globe, Lock, Pencil, Plus, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { CopyLinkButton } from "@/components/lineup";
import { MAX_LINEUPS_PER_OWNER, sizeLabel } from "@/lib/lineup-meta";
import type { LineupModel } from "@/types";
import { useLineupListPage } from "./hook";

const LineupListPage = () => {
  const s = useLineupListPage();
  const atLimit = s.mine.length >= MAX_LINEUPS_PER_OWNER;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Đội hình</h1>
          <p className="text-muted-foreground">
            Tạo và quản lý đội hình của bạn ({s.mine.length}/{MAX_LINEUPS_PER_OWNER}).
          </p>
        </div>
        {atLimit ? (
          <Button disabled title={`Tối đa ${MAX_LINEUPS_PER_OWNER} đội hình`}>
            <Plus className="size-4" />
            Tạo đội hình
          </Button>
        ) : (
          <Button asChild>
            <Link href="/lineup/new">
              <Plus className="size-4" />
              Tạo đội hình
            </Link>
          </Button>
        )}
      </div>

      {/* ── My lineups ─────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Đội hình của tôi</h2>
        {s.isLoading ? (
          <CardGridSkeleton />
        ) : s.mine.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {s.mine.map((lineup) => (
              <LineupCard
                key={lineup.id}
                lineup={lineup}
                owned
                onDelete={() => s.setPendingDelete(lineup.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Community lineups ──────────────────────────────── */}
      {s.community.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Đội hình công khai</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {s.community.map((lineup) => (
              <LineupCard key={lineup.id} lineup={lineup} />
            ))}
          </div>
        </section>
      ) : null}

      <DeleteDialog
        open={!!s.pendingDelete}
        title="Xóa đội hình?"
        description="Hành động này không thể hoàn tác."
        loading={s.isDeleting}
        onOpenChange={(open) => !open && s.setPendingDelete(null)}
        onConfirm={s.confirmDelete}
      />
    </div>
  );
};

export default LineupListPage;

// ── Sub-components ────────────────────────────────────────────

const LineupCard = ({
  lineup,
  owned,
  onDelete,
}: {
  lineup: LineupModel;
  owned?: boolean;
  onDelete?: () => void;
}) => (
  <Card className="flex flex-col">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between gap-2">
        <CardTitle className="line-clamp-2 text-base">{lineup.name}</CardTitle>
        <Badge variant={lineup.isPublic ? "secondary" : "outline"} className="shrink-0 gap-1">
          {lineup.isPublic ? <Globe className="size-3" /> : <Lock className="size-3" />}
          {lineup.isPublic ? "Công khai" : "Riêng tư"}
        </Badge>
      </div>
    </CardHeader>

    <CardContent className="flex flex-1 flex-col gap-2 pb-3 text-sm text-muted-foreground">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{sizeLabel(lineup.size)}</Badge>
        <span className="flex items-center gap-1">
          <Users className="size-3.5" />
          {lineup.slots.length}
        </span>
      </div>
      {!owned && lineup.owner ? (
        <span className="text-xs">bởi {lineup.owner.fullName}</span>
      ) : null}
      <span className="text-xs">
        Cập nhật {formatDistanceToNow(new Date(lineup.updatedAt), { addSuffix: true, locale: vi })}
      </span>
    </CardContent>

    <CardFooter className="flex gap-2 pt-0">
      <Button asChild variant="outline" size="sm" className="flex-1">
        <Link href={`/lineups/${lineup.id}`}>
          <Eye className="size-4" />
          Xem
        </Link>
      </Button>
      {owned ? (
        <>
          <CopyLinkButton lineupId={lineup.id} label="" size="sm" aria-label="Copy link" />
          <Button asChild variant="outline" size="sm">
            <Link href={`/lineup/${lineup.id}`} aria-label="Sửa">
              <Pencil className="size-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
            aria-label="Xóa"
          >
            <Trash2 className="size-4" />
          </Button>
        </>
      ) : null}
    </CardFooter>
  </Card>
);

const CardGridSkeleton = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <Skeleton key={i} className="h-44 rounded-xl" />
    ))}
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-14 text-center">
    <Users className="size-10 text-muted-foreground" />
    <p className="text-muted-foreground">Bạn chưa tạo đội hình nào.</p>
    <Button asChild>
      <Link href="/lineup/new">
        <Plus className="size-4" />
        Tạo đội hình đầu tiên
      </Link>
    </Button>
  </div>
);
