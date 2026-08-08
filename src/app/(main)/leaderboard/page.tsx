"use client";

import { Goal, Handshake, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLeaderboard } from "@/hooks/schedule";
import { cn } from "@/lib/utils";

type Metric = "goals" | "assists";

const LeaderboardPage = () => {
  // One fetch (sorted by goals server-side, all players); the buttons below only
  // re-sort on the client, so there's no refetch when toggling.
  const [sortBy, setSortBy] = useState<Metric>("goals");
  const { data, isLoading } = useLeaderboard({ metric: "goals", limit: 100 });

  const rows = useMemo(
    () =>
      [...(data ?? [])].sort(
        (a, b) => b[sortBy] - a[sortBy] || b.goals + b.assists - (a.goals + a.assists),
      ),
    [data, sortBy],
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 lg:px-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <Trophy className="size-6 text-amber-500" />
          Bảng xếp hạng
        </h1>
        <p className="text-muted-foreground">Quý hiện tại.</p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Sắp xếp theo:</span>
        <Button
          variant={sortBy === "goals" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("goals")}
        >
          <Goal className="size-4" />
          Bàn thắng
        </Button>
        <Button
          variant={sortBy === "assists" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("assists")}
        >
          <Handshake className="size-4" />
          Kiến tạo
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          Chưa có dữ liệu trong quý này.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-center">#</TableHead>
                <TableHead>Cầu thủ</TableHead>
                <TableHead
                  className={cn(
                    "text-center",
                    sortBy === "goals" && "text-primary",
                  )}
                >
                  Bàn
                </TableHead>
                <TableHead
                  className={cn(
                    "text-center",
                    sortBy === "assists" && "text-primary",
                  )}
                >
                  Kiến tạo
                </TableHead>
                <TableHead className="text-center">Trận</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => {
                const name = r.player.fullName || r.player.username;
                return (
                  <TableRow key={r.player.id}>
                    <TableCell className="text-center font-bold text-muted-foreground">
                      {i + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarImage src={r.player.avatarUrl ?? undefined} />
                          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{name}</div>
                          {r.player.nickname ? (
                            <div className="truncate text-xs text-muted-foreground">
                              {r.player.nickname}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-center text-lg font-bold tabular-nums",
                        sortBy === "goals"
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    >
                      {r.goals}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-center text-lg font-bold tabular-nums",
                        sortBy === "assists"
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    >
                      {r.assists}
                    </TableCell>
                    <TableCell className="text-center tabular-nums text-muted-foreground">
                      {r.matchesPlayed}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
