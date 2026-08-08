"use client";

import { AlertTriangle, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SCHEDULE_LIMITS } from "@/constants/schedule";
import { useReportStats, useVoteMvp } from "@/hooks/schedule";
import type { MatchPlayerModel } from "@/types";

const errMsg = (e: unknown) =>
  String((e as { message?: unknown })?.message ?? "Lỗi");

// Trên mức này thì chắc chắn là... đang chém gió.
const BRAG_THRESHOLD = 20;

const HonestyNote = () => (
  <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
    <span>
      Khai thật giùm cái nha 🙏 Số liệu bạn tự khai và tính vào bảng xếp hạng
      của cả đội đó.
    </span>
  </div>
);

export type MatchReportSectionProps = {
  matchId: string;
  mine: MatchPlayerModel;
  participants: MatchPlayerModel[];
  voterId: string;
};

// Self-report goals/assists + MVP ballot for a participant. Shown only inside
// the post-match report window; shared by the match detail page and the
// schedule day dialog.
export const MatchReportSection = ({
  matchId,
  mine,
  participants,
  voterId,
}: MatchReportSectionProps) => {
  const [goals, setGoals] = useState(mine.goals);
  const [assists, setAssists] = useState(mine.assists);
  const [mvp, setMvp] = useState<string>("");

  useEffect(() => {
    setGoals(mine.goals);
    setAssists(mine.assists);
  }, [mine.goals, mine.assists]);

  const report = useReportStats();
  const voteMvp = useVoteMvp();

  const overGoals = goals > BRAG_THRESHOLD;
  const overAssists = assists > BRAG_THRESHOLD;
  const bragText = [
    overGoals ? `${goals} bàn` : null,
    overAssists ? `${assists} kiến tạo` : null,
  ]
    .filter(Boolean)
    .join(" + ");

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Khai báo thành tích 🐐</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <HonestyNote />
        <div className="flex items-end gap-3">
          <div className="w-28">
            <Label className="text-xs">Bàn thắng</Label>
            <Input
              type="number"
              min={0}
              max={SCHEDULE_LIMITS.GOALS_MAX}
              value={goals}
              onChange={(e) => setGoals(Math.max(0, Number(e.target.value) || 0))}
            />
          </div>
          <div className="w-28">
            <Label className="text-xs">Kiến tạo</Label>
            <Input
              type="number"
              min={0}
              max={SCHEDULE_LIMITS.ASSISTS_MAX}
              value={assists}
              onChange={(e) =>
                setAssists(Math.max(0, Number(e.target.value) || 0))
              }
            />
          </div>
          <Button
            onClick={() =>
              report.mutate(
                { id: matchId, body: { playerId: voterId, goals, assists } },
                {
                  onSuccess: () => toast.success("Đã lưu bàn thắng/kiến tạo"),
                  onError: (e) => toast.error(errMsg(e)),
                },
              )
            }
            disabled={report.isPending}
          >
            Lưu
          </Button>
        </div>

        {overGoals || overAssists ? (
          <p className="flex items-center gap-2 rounded-md border border-orange-500/50 bg-orange-500/10 p-2 text-sm font-medium text-orange-600 dark:text-orange-400">
            <span className="text-base">😏</span>
            Bớt xạo đi ní! {bragText} một trận phủi thôi mà, tin sao nổi 😂
          </p>
        ) : null}

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Label className="text-xs">Bầu MVP</Label>
            <Select value={mvp} onValueChange={setMvp}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn cầu thủ xuất sắc nhất" />
              </SelectTrigger>
              <SelectContent>
                {participants.map((p) => (
                  <SelectItem key={p.playerId} value={p.playerId}>
                    {p.player?.fullName ?? p.player?.username ?? p.playerId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            disabled={!mvp || voteMvp.isPending}
            onClick={() =>
              voteMvp.mutate(
                { id: matchId, body: { voterId, mvpPlayerId: mvp } },
                {
                  onSuccess: () => toast.success("Đã bầu MVP"),
                  onError: (e) => toast.error(errMsg(e)),
                },
              )
            }
          >
            <Crown className="size-4" />
            Bầu
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchReportSection;
