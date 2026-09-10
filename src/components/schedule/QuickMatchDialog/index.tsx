"use client";

import { CalendarPlus, Search, Users } from "lucide-react";
import { ClearableInput } from "@/components/admin/ClearableInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { SCHEDULE_LIMITS } from "@/constants/schedule";
import { useQuickMatchForm } from "./hook";
import type { QuickMatchDialogProps, QuickMatchFormProps } from "./type";

export type { QuickMatchDialogProps };

// Admin-only quick create: pick a day + the players (and their guests) and the
// match is created straight away, skipping the vote step. Anyone who already
// voted that day is merged into the participant list by the server.
export const QuickMatchDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: QuickMatchDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Thêm trận đấu</DialogTitle>
        <DialogDescription>
          Chọn ngày và cầu thủ tham gia — không cần chờ vote. Ai đã vote ngày đó
          cũng được thêm vào danh sách.
        </DialogDescription>
      </DialogHeader>

      {/* Remount per open so a cancelled draft never carries over. */}
      {open ? (
        <QuickMatchForm
          onCancel={() => onOpenChange(false)}
          onSuccess={(matchId) => {
            onOpenChange(false);
            onSuccess?.(matchId);
          }}
        />
      ) : null}
    </DialogContent>
  </Dialog>
);

const QuickMatchForm = (props: QuickMatchFormProps) => {
  const {
    matchDate,
    setMatchDate,
    location,
    setLocation,
    keyword,
    setKeyword,
    options,
    isLoadingPlayers,
    picked,
    togglePlayer,
    setGuestCount,
    toggleVisible,
    allVisiblePicked,
    totalHeads,
    canSubmit,
    isPending,
    submit,
  } = useQuickMatchForm(props);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-44">
          <Label className="text-xs">Ngày</Label>
          <DatePicker
            value={matchDate}
            onChange={setMatchDate}
            disabled={isPending}
            placeholder="Chọn ngày"
          />
        </div>
        <div className="min-w-44 flex-1">
          <Label className="text-xs">Sân (tuỳ chọn)</Label>
          <ClearableInput
            value={location}
            disabled={isPending}
            placeholder="Tên sân"
            onChange={(e) => setLocation(e.target.value)}
            onClear={() => setLocation("")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Cầu thủ</Label>
          <Badge variant="secondary" className="font-normal">
            <Users className="mr-1 size-3" />
            {picked.size} người · {totalHeads} suất
          </Badge>
        </div>

        <div className="relative">
          <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <ClearableInput
            value={keyword}
            disabled={isPending}
            placeholder="Tìm cầu thủ"
            className="pl-8"
            onChange={(e) => setKeyword(e.target.value)}
            onClear={() => setKeyword("")}
          />
        </div>

        <div className="rounded-md border">
          <label className="flex cursor-pointer items-center gap-2 border-b px-3 py-2 text-sm">
            <Checkbox
              checked={allVisiblePicked}
              disabled={isPending || options.length === 0}
              onCheckedChange={(v) => toggleVisible(v === true)}
            />
            <span className="text-muted-foreground">
              Chọn tất cả ({options.length})
            </span>
          </label>

          <div className="max-h-64 divide-y overflow-y-auto">
            {isLoadingPlayers ? (
              <div className="flex flex-col gap-2 p-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-6" />
                ))}
              </div>
            ) : options.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">
                Không tìm thấy cầu thủ nào.
              </p>
            ) : (
              options.map((player) => {
                const guests = picked.get(player.id);
                const isPicked = guests !== undefined;
                return (
                  <div
                    key={player.id}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm"
                  >
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                      <Checkbox
                        checked={isPicked}
                        disabled={isPending}
                        onCheckedChange={(v) =>
                          togglePlayer(player.id, v === true)
                        }
                      />
                      <span className="truncate">
                        {player.fullName}
                        {player.nickname ? (
                          <span className="text-muted-foreground">
                            {` (${player.nickname})`}
                          </span>
                        ) : null}
                      </span>
                    </label>
                    {isPicked ? (
                      <span className="flex shrink-0 items-center gap-1">
                        <Input
                          type="number"
                          min={0}
                          max={SCHEDULE_LIMITS.GUEST_MAX}
                          value={guests}
                          disabled={isPending}
                          aria-label={`Số khách của ${player.fullName}`}
                          className="h-8 w-16"
                          onChange={(e) =>
                            setGuestCount(player.id, Number(e.target.value))
                          }
                        />
                        <span className="text-xs text-muted-foreground">
                          khách
                        </span>
                      </span>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" disabled={isPending} onClick={props.onCancel}>
          Huỷ
        </Button>
        <Button disabled={!canSubmit} onClick={submit}>
          <CalendarPlus className="size-4" />
          {isPending ? "Đang tạo…" : "Tạo trận"}
        </Button>
      </DialogFooter>
    </div>
  );
};
