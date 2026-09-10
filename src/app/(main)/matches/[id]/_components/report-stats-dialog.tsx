"use client";

import { AlertTriangle, PencilLine } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SCHEDULE_LIMITS } from "@/constants/schedule";
import { useReportStats } from "@/hooks/schedule";
import type { MatchPlayerModel } from "@/types";

const errMsg = (e: unknown) =>
  String((e as { message?: unknown })?.message ?? "Lỗi");

// Trên mức này thì chắc chắn là... đang chém gió.
const BRAG_THRESHOLD = 20;

// The one place a player declares their own goals + assists for a match. Lives
// behind a single button in the deadline strip at the top of /matches/:id; the
// API only accepts it inside the report window, so the caller renders this only
// while that window is open.
export const ReportStatsDialog = ({
  matchId,
  mine,
  playerId,
}: {
  matchId: string;
  mine: MatchPlayerModel;
  playerId: string;
}) => {
  const [open, setOpen] = useState(false);
  const [goals, setGoals] = useState(mine.goals);
  const [assists, setAssists] = useState(mine.assists);
  const report = useReportStats();

  // Re-seed from the saved values each time the dialog opens (and whenever the
  // server numbers change under us).
  useEffect(() => {
    if (open) {
      setGoals(mine.goals);
      setAssists(mine.assists);
    }
  }, [open, mine.goals, mine.assists]);

  const overGoals = goals > BRAG_THRESHOLD;
  const overAssists = assists > BRAG_THRESHOLD;
  const bragText = [
    overGoals ? `${goals} bàn` : null,
    overAssists ? `${assists} kiến tạo` : null,
  ]
    .filter(Boolean)
    .join(" + ");

  const onSave = () =>
    report.mutate(
      { id: matchId, body: { playerId, goals, assists } },
      {
        onSuccess: () => {
          toast.success("Đã lưu bàn thắng/kiến tạo");
          setOpen(false);
        },
        onError: (e) => toast.error(errMsg(e)),
      },
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full shrink-0 sm:w-auto">
          <PencilLine className="size-4" />
          Nhập bàn thắng &amp; kiến tạo
          <span className="text-primary-foreground/70">
            ({mine.goals}/{mine.assists})
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Khai báo thành tích 🐐</DialogTitle>
          <DialogDescription>
            Số bàn thắng và kiến tạo của riêng bạn trong trận này.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
            <span>
              Khai thật giùm cái nha 🙏 Số liệu bạn tự khai và tính vào bảng xếp
              hạng của cả đội đó.
            </span>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-xs">Bàn thắng</Label>
              <Input
                type="number"
                min={0}
                max={SCHEDULE_LIMITS.GOALS_MAX}
                value={goals}
                onChange={(e) =>
                  setGoals(Math.max(0, Number(e.target.value) || 0))
                }
              />
            </div>
            <div className="flex-1">
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
          </div>

          {overGoals || overAssists ? (
            <p className="flex items-center gap-2 rounded-md border border-orange-500/50 bg-orange-500/10 p-2 text-sm font-medium text-orange-600 dark:text-orange-400">
              <span className="text-base">😏</span>
              Bớt xạo đi ní! {bragText} một trận phủi thôi mà, tin sao nổi 😂
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button onClick={onSave} disabled={report.isPending}>
            {report.isPending ? "Đang lưu…" : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
