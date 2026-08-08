"use client";

import { startOfDay } from "date-fns";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SCHEDULE_LIMITS } from "@/constants/schedule";
import { useDeleteMatchVote, useUpsertMatchVote } from "@/hooks/schedule";
import type { MatchVoteModel } from "@/types";
import { DayMatchReport } from "./day-match-report";
import { VoterRows } from "./voter-rows";
import { errMsg } from "./utils";

export type DayPanelProps = {
  day: Date;
  playerId: string;
  dayVotes: MatchVoteModel[];
  onDone: () => void;
};

// The vote dialog body: vote status + voter list + (for confirmed matches) the
// result/report block, and the vote / unvote form.
export const DayPanel = ({ day, playerId, dayVotes, onDone }: DayPanelProps) => {
  const mine = dayVotes.find((v) => v.playerId === playerId);
  const hasMatch = dayVotes.some((v) => v.matchId);

  const [guestCount, setGuestCount] = useState(mine?.guestCount ?? 0);
  const [note, setNote] = useState(mine?.note ?? "");

  const upsert = useUpsertMatchVote();
  const remove = useDeleteMatchVote();

  const onVoteSubmit = () =>
    upsert.mutate(
      {
        playerId,
        voteDate: startOfDay(day).toISOString(),
        guestCount,
        note: note || undefined,
      },
      {
        onSuccess: () => {
          toast.success(mine ? "Đã cập nhật vote" : "Đã vote");
          onDone();
        },
        onError: (e) => toast.error(errMsg(e)),
      },
    );

  const onUnvote = () => {
    if (!mine) return;
    remove.mutate(mine.id, {
      onSuccess: () => {
        toast.success("Đã bỏ vote");
        onDone();
      },
      onError: (e) => toast.error(errMsg(e)),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {hasMatch ? (
        <Badge className="w-fit">Đã chốt trận</Badge>
      ) : mine ? (
        <Badge variant="secondary" className="w-fit">
          Bạn đã vote ngày này
        </Badge>
      ) : null}

      {dayVotes.length ? (
        <div className="rounded-md border p-3">
          <VoterRows votes={dayVotes} />
        </div>
      ) : null}

      {/* I took part in this day's confirmed match → report stats + MVP. */}
      <DayMatchReport dayVotes={dayVotes} playerId={playerId} />

      <div className="border p-2">
        <span className="text-destructive">Nếu có rủ thêm người ngoài</span>
        <div className="flex items-end gap-2">
          <div className="w-24">
            <Label className="text-xs">Khách mời </Label>
            <Input
              type="number"
              min={0}
              max={SCHEDULE_LIMITS.GUEST_MAX}
              value={guestCount}
              onChange={(e) =>
                setGuestCount(Math.max(0, Number(e.target.value) || 0))
              }
            />
          </div>
          <div className="flex-1">
            <Label className="text-xs">Ghi chú</Label>
            <Input
              maxLength={SCHEDULE_LIMITS.NOTE_MAX}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="tuỳ chọn"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onVoteSubmit}
          disabled={upsert.isPending}
          className="flex-1"
        >
          {mine ? "Cập nhật vote" : "Vote ngày này"}
        </Button>
        {mine ? (
          <Button
            variant="destructive"
            onClick={onUnvote}
            disabled={remove.isPending}
          >
            <Trash2 className="size-4" />
            Bỏ vote
          </Button>
        ) : null}
      </div>
    </div>
  );
};
