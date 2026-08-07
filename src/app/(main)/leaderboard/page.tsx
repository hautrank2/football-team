"use client";

import { Goal, Handshake, Trophy } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeaderboard } from "@/hooks/schedule";

type Metric = "goals" | "assists";

const LeaderboardPage = () => {
  const [metric, setMetric] = useState<Metric>("goals");
  const { data, isLoading } = useLeaderboard({ metric });
  const rows = (data ?? []).filter((r) => (metric === "goals" ? r.goals : r.assists) > 0);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 lg:px-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <Trophy className="size-6 text-amber-500" />
          Bảng xếp hạng
        </h1>
        <p className="text-muted-foreground">Quý hiện tại.</p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={metric === "goals" ? "default" : "outline"}
          size="sm"
          onClick={() => setMetric("goals")}
        >
          <Goal className="size-4" />
          Vua phá lưới
        </Button>
        <Button
          variant={metric === "assists" ? "default" : "outline"}
          size="sm"
          onClick={() => setMetric("assists")}
        >
          <Handshake className="size-4" />
          Vua kiến tạo
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          Chưa có dữ liệu trong quý này.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((r, i) => {
            const value = metric === "goals" ? r.goals : r.assists;
            const name = r.player.fullName || r.player.username;
            return (
              <Card key={r.player.id}>
                <CardContent className="flex items-center gap-3 py-3">
                  <span className="w-6 text-center text-lg font-bold text-muted-foreground">{i + 1}</span>
                  <Avatar className="size-9">
                    <AvatarImage src={r.player.avatarUrl ?? undefined} />
                    <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{name}</div>
                    <div className="text-xs text-muted-foreground">{r.matchesPlayed} trận</div>
                  </div>
                  <span className="text-xl font-bold text-primary">{value}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
