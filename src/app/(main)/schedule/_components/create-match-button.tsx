"use client";

import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts";
import { useCreateMatch } from "@/hooks/schedule";
import type { MatchVoteModel } from "@/types";
import { dayKey, errMsg } from "./utils";

export type CreateMatchButtonProps = {
  day: Date;
  dayVotes: MatchVoteModel[];
  onDone: () => void;
};

// Admin-only shortcut inside the day detail dialog: confirm the day into a match
// straight from the voter list. Hidden for non-admins and for days that are
// already a confirmed match; disabled when nobody voted (the API needs ≥ 1 vote).
export const CreateMatchButton = ({ day, dayVotes, onDone }: CreateMatchButtonProps) => {
  const { isAdmin } = useAuth();
  const create = useCreateMatch();

  if (!isAdmin) return null;
  // Already confirmed → the report block handles it; no create button.
  if (dayVotes.some((v) => v.matchId)) return null;

  const voterCount = dayVotes.length;
  const slots = dayVotes.reduce((s, v) => s + 1 + v.guestCount, 0);
  const canCreate = voterCount > 0;

  const onCreate = () =>
    create.mutate(
      { matchDate: dayKey(day) },
      {
        onSuccess: () => {
          toast.success("Đã tạo trận");
          onDone();
        },
        onError: (e) => toast.error(errMsg(e)),
      },
    );

  return (
    <div className="border-t pt-4">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className="w-full" disabled={!canCreate || create.isPending}>
            <CalendarPlus className="size-4" />
            {canCreate ? "Tạo trận đấu" : "Chưa có ai vote"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tạo trận đấu?</AlertDialogTitle>
            <AlertDialogDescription>
              Chốt ngày này thành trận: {voterCount} người vote ({slots} suất) sẽ
              được đưa vào danh sách tham gia.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={onCreate}>Tạo trận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
