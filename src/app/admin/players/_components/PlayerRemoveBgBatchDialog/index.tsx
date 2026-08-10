"use client";

import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePlayerRemoveBgBatchDialog } from "./hook";
import type { PlayerRemoveBgBatchDialogProps } from "./type";

export type { PlayerRemoveBgBatchDialogProps };

// Checkerboard so the transparent PNG's cut-out is obvious in the preview.
const CHECKER: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(45deg,#d4d4d8 25%,transparent 25%),linear-gradient(-45deg,#d4d4d8 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#d4d4d8 75%),linear-gradient(-45deg,transparent 75%,#d4d4d8 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
};

export const PlayerRemoveBgBatchDialog = (props: PlayerRemoveBgBatchDialogProps) => {
  const { open, players, onOpenChange } = props;
  const s = usePlayerRemoveBgBatchDialog(props);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Xóa nền hàng loạt</DialogTitle>
          <DialogDescription>
            {players.length} cầu thủ được chọn. Bấm Convert để xử lý một lần, xem trước rồi Submit.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {players.map((player) => (
            <div key={player.id} className="rounded-md border p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">{player.fullName}</p>
                {!player.avatarUrl ? (
                  <span className="shrink-0 text-xs text-destructive">Chưa có ảnh</span>
                ) : s.resultUrls[player.id] ? (
                  <span className="shrink-0 text-xs text-muted-foreground">Đã xử lý</span>
                ) : (
                  <span className="shrink-0 text-xs text-muted-foreground">Chờ xử lý</span>
                )}
              </div>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Avatar className="size-64 rounded-md">
                  <AvatarImage src={player.avatarUrl ?? undefined} className="object-cover" />
                  <AvatarFallback className="rounded-md text-3xl">
                    {player.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <ArrowRight className="size-5 shrink-0 rotate-90 text-muted-foreground sm:rotate-0" />

                <div
                  className="flex size-64 shrink-0 items-center justify-center overflow-hidden rounded-md border"
                  style={CHECKER}
                >
                  {s.resultUrls[player.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.resultUrls[player.id]}
                      alt="Ảnh đã xóa nền"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="px-2 text-center text-xs text-muted-foreground">
                      Chưa có
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={s.convert}
            disabled={s.converting || players.every((p) => !p.avatarUrl)}
          >
            {s.converting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {s.converting ? "Đang xử lý…" : "Convert"}
          </Button>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button type="button" onClick={s.submit} disabled={s.resultCount === 0 || s.submitting}>
            {s.submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            Submit{s.resultCount > 0 ? ` (${s.resultCount})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
