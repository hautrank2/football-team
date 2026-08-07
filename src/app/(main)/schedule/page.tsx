"use client";

import { addMonths, eachDayOfInterval, format, startOfDay, subMonths } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarPlus, ChevronLeft, ChevronRight, LogIn, Trash2, Users } from "lucide-react";
import Link from "next/link";
import {
  type ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DayButton } from "react-day-picker";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  isVotableDate,
  SCHEDULE_LIMITS,
  voteWindow,
} from "@/constants/schedule";
import { useAuth } from "@/contexts";
import {
  useDeleteMatchVote,
  useMatchVotes,
  useUpsertMatchVote,
} from "@/hooks/schedule";
import { cn } from "@/lib/utils";
import type { MatchVoteModel } from "@/types";

const errMsg = (e: unknown) =>
  String((e as { message?: unknown })?.message ?? "Lỗi");
const dayKey = (d: Date) => format(d, "yyyy-MM-dd");
const voterName = (v: MatchVoteModel) =>
  v.player?.fullName ?? v.player?.username ?? "Ẩn danh";

// The per-day detail list — one row per voter (name, guests, note) plus the
// total. Shared by the Chi tiết tooltip, the detail dialog, and the vote dialog.
const VoterRows = ({ votes }: { votes: MatchVoteModel[] }) => {
  if (votes.length === 0)
    return <p className="text-xs text-muted-foreground">Chưa có ai vote.</p>;
  const heads = votes.reduce((s, v) => s + 1 + v.guestCount, 0);
  return (
    <Table className="text-xs">
      <TableHeader>
        <TableRow>
          <TableHead className="h-8 px-2">Cầu thủ</TableHead>
          <TableHead className="h-8 px-2 text-center">Khách</TableHead>
          <TableHead className="h-8 px-2">Ghi chú</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {votes.map((v) => (
          <TableRow key={v.id}>
            <TableCell className="px-2 py-1 font-medium">
              {voterName(v)}
            </TableCell>
            <TableCell className="px-2 py-1 text-center">
              {v.guestCount || "—"}
            </TableCell>
            <TableCell className="px-2 py-1 text-muted-foreground">
              {v.note || "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell className="px-2 py-1" colSpan={3}>
            Tổng: {heads} suất
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

// A calendar day cell: day number + "<players>+<guests>" on the face; on hover
// (pointer devices only) a Vote + Chi tiết overlay. Chi tiết previews the voter
// list on hover and opens the detail dialog on click.
const makeDayButton = (
  votesByDay: Map<string, MatchVoteModel[]>,
  onVote: (d: Date) => void,
  onDetail: (d: Date) => void,
  canVoteOn: (d: Date) => boolean,
) => {
  const DayCell = ({
    className,
    day,
    modifiers,
    children,
    ...props
  }: ComponentProps<typeof DayButton>) => {
    const ref = useRef<HTMLButtonElement>(null);
    useEffect(() => {
      if (modifiers.focused) ref.current?.focus();
    }, [modifiers.focused]);

    const votes = votesByDay.get(dayKey(day.date)) ?? [];
    const players = votes.length;
    const guests = votes.reduce((s, v) => s + v.guestCount, 0);
    const canVote = canVoteOn(day.date);

    return (
      <div className="group/day relative h-full w-full">
        <Button
          ref={ref}
          variant="ghost"
          size="icon"
          data-day={day.date.toLocaleDateString()}
          data-selected-single={
            modifiers.selected &&
            !modifiers.range_start &&
            !modifiers.range_end &&
            !modifiers.range_middle
          }
          className={cn(
            "flex aspect-square h-auto w-full min-w-[--cell-size] flex-col items-center justify-start gap-0.5 p-1 font-normal leading-none data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground",
            className,
          )}
          {...props}
        >
          <span className="text-sm">{children}</span>
          {players > 0 ? (
            <span className="flex items-center gap-0.5 text-[10px] font-medium leading-none text-primary">
              <Users className="size-2.5" />
              {guests > 0 ? `${players + guests}` : players}
            </span>
          ) : null}
        </Button>

        {canVote || players > 0 ? (
          <div className="absolute inset-0 hidden flex-col items-center justify-center gap-1 rounded-md bg-background/95 p-1 [@media(hover:hover)]:group-hover/day:flex">
            {canVote ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onVote(day.date);
                }}
                className="w-full rounded bg-primary px-1 py-1 text-[10px] font-medium text-primary-foreground hover:opacity-90"
              >
                Vote
              </button>
            ) : null}
            {players > 0 ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDetail(day.date);
                    }}
                    className="w-full rounded border px-1 py-1 text-[10px] font-medium hover:bg-accent"
                  >
                    Chi tiết
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-64 border bg-popover text-popover-foreground">
                  <VoterRows votes={votes} />
                </TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  };
  return DayCell;
};

const SchedulePage = () => {
  const { user, isReady } = useAuth();
  const now = useMemo(() => new Date(), []);
  const win = useMemo(() => voteWindow(now), [now]);

  const firstVotable = useMemo(
    () =>
      eachDayOfInterval({ start: win.start, end: win.end }).find((d) =>
        isVotableDate(d, now),
      ),
    [win, now],
  );

  const [voteDay, setVoteDay] = useState<Date | undefined>(undefined);
  const [voteOpen, setVoteOpen] = useState(false);
  const [detailDay, setDetailDay] = useState<Date | undefined>(undefined);
  const [detailOpen, setDetailOpen] = useState(false);
  const [month, setMonth] = useState<Date>(() => firstVotable ?? now);

  const votesQuery = useMatchVotes({
    startVoteDateAt: win.start.toISOString(),
    endVoteDateAt: win.end.toISOString(),
    pageSize: 500,
    populations: ["player"],
  });
  const votes = useMemo(() => votesQuery.data?.items ?? [], [votesQuery.data]);

  const votesByDay = useMemo(() => {
    const map = new Map<string, MatchVoteModel[]>();
    for (const v of votes) {
      const key = dayKey(new Date(v.voteDate));
      const list = map.get(key);
      if (list) list.push(v);
      else map.set(key, [v]);
    }
    return map;
  }, [votes]);

  const votedDays = useMemo(
    () =>
      votes
        .filter((v) => v.playerId === user?.id)
        .map((v) => new Date(v.voteDate)),
    [votes, user?.id],
  );
  const matchDays = useMemo(
    () => votes.filter((v) => v.matchId).map((v) => new Date(v.voteDate)),
    [votes],
  );

  const onVote = useCallback((d: Date) => {
    setVoteDay(d);
    setVoteOpen(true);
  }, []);
  const onDetail = useCallback((d: Date) => {
    setDetailDay(d);
    setDetailOpen(true);
  }, []);
  const canVoteOn = useCallback((d: Date) => isVotableDate(d, now), [now]);

  const components = useMemo(
    () => ({ DayButton: makeDayButton(votesByDay, onVote, onDetail, canVoteOn) }),
    [votesByDay, onVote, onDetail, canVoteOn],
  );

  if (isReady && !user) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center">
        <CalendarPlus className="size-12 text-muted-foreground" />
        <h1 className="text-2xl font-semibold">Lịch đấu</h1>
        <p className="text-muted-foreground">
          Đăng nhập để vote ngày bạn muốn chơi.
        </p>
        <Button asChild>
          <Link href="/login">
            <LogIn className="size-4" />
            Đăng nhập
          </Link>
        </Button>
      </div>
    );
  }

  const voteDayVotes = voteDay ? (votesByDay.get(dayKey(voteDay)) ?? []) : [];
  const detailDayVotes = detailDay
    ? (votesByDay.get(dayKey(detailDay)) ?? [])
    : [];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Lịch đấu</h1>
          <p className="text-muted-foreground">
            Chọn ngày bạn muốn chơi (chỉ tuần này &amp; tuần sau). Vote khóa lúc
            19h ngày đó.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-primary/25" /> Đã vote
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm ring-1 ring-primary" /> Đã chốt
            trận
          </span>
        </div>
      </div>

      {votesQuery.isLoading ? (
        <Skeleton className="h-[70vh] w-full rounded-2xl" />
      ) : (
        <div className="rounded-2xl border bg-card p-2 sm:p-6">
          {/* Month switcher (prev / next) */}
          <div className="mb-3 flex items-center justify-between px-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Tháng trước"
              onClick={() => setMonth((m) => subMonths(m, 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-base font-semibold capitalize">
              {format(month, "LLLL yyyy", { locale: vi })}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Tháng sau"
              onClick={() => setMonth((m) => addMonths(m, 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <TooltipProvider delayDuration={120}>
            <Calendar
              mode="single"
              locale={vi}
              month={month}
              onMonthChange={setMonth}
              // Base click: votable day → vote dialog; otherwise → detail dialog.
              selected={voteDay}
              onSelect={(d) => {
                if (!d) return;
                if (isVotableDate(d, now)) onVote(d);
                else onDetail(d);
              }}
              modifiers={{ voted: votedDays, hasMatch: matchDays }}
              modifiersClassNames={{
                voted: "bg-primary/20 rounded-lg",
                hasMatch: "ring-1 ring-primary rounded-lg",
              }}
              components={components}
              // Big, full-width calendar: scale every cell with the viewport.
              className="w-full [--cell-size:clamp(3rem,10vw,6rem)]"
              classNames={{
                root: "w-full",
                month: "flex w-full flex-col gap-4",
                nav: "hidden",
                month_caption: "hidden",
              }}
            />
          </TooltipProvider>
        </div>
      )}

      {/* Vote dialog (also the mobile/tablet entry point — includes the detail list). */}
      <Dialog open={voteOpen} onOpenChange={setVoteOpen}>
        <DialogContent>
          {voteDay ? (
            <>
              <DialogHeader>
                <DialogTitle className="capitalize">
                  {format(voteDay, "EEEE, dd/MM/yyyy", { locale: vi })}
                </DialogTitle>
                <DialogDescription>
                  {voteDayVotes.length} người ·{" "}
                  {voteDayVotes.reduce((s, v) => s + 1 + v.guestCount, 0)} suất
                </DialogDescription>
              </DialogHeader>
              <DayPanel
                key={voteDay.toISOString()}
                day={voteDay}
                playerId={user?.id ?? ""}
                dayVotes={voteDayVotes}
                onDone={() => setVoteOpen(false)}
              />
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Detail dialog (from the "Chi tiết" button). */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          {detailDay ? (
            <>
              <DialogHeader>
                <DialogTitle className="capitalize">
                  {format(detailDay, "EEEE, dd/MM/yyyy", { locale: vi })}
                </DialogTitle>
                <DialogDescription>Danh sách người đã vote</DialogDescription>
              </DialogHeader>
              <VoterRows votes={detailDayVotes} />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchedulePage;

type DayPanelProps = {
  day: Date;
  playerId: string;
  dayVotes: MatchVoteModel[];
  onDone: () => void;
};

const DayPanel = ({ day, playerId, dayVotes, onDone }: DayPanelProps) => {
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
            variant="outline"
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
