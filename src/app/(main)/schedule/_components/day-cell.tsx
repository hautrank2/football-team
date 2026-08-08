"use client";

import { Crown, Goal, Handshake, Users } from "lucide-react";
import { type ComponentProps, useEffect, useRef } from "react";
import { DayButton } from "react-day-picker";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { MatchVoteModel } from "@/types";
import { dayKey, type DayHighlights } from "./utils";
import { VoterRows } from "./voter-rows";

// A calendar day cell: day number + "<players>+<guests>" on the face; on hover
// (pointer devices only) a Vote + Chi tiết overlay. Chi tiết previews the voter
// list on hover and opens the detail dialog on click.
export const makeDayButton = (
  votesByDay: Map<string, MatchVoteModel[]>,
  highlightsByDay: Map<string, DayHighlights>,
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
    const highlights = highlightsByDay.get(dayKey(day.date));

    return (
      <Tooltip>
        <TooltipTrigger asChild>
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
            "flex border border-muted aspect-square h-auto w-full min-w-[--cell-size] flex-col justify-start gap-0.5 p-2 font-normal leading-none",
            className,
          )}
          {...props}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-sm">{children}</span>
            {players > 0 ? (
              <span className="flex items-center gap-0.5 text-[10px] font-medium leading-none text-primary">
                <Users className="size-2.5" />
                {guests > 0 ? `${players + guests}` : players}
              </span>
            ) : null}
          </div>

          {/* MVP / vua phá lưới / vua kiến tạo — surfaced right on the cell. */}
          {highlights ? (
            <span className="mt-0.5 hidden w-full flex-col items-stretch gap-0.5 text-[9px] leading-tight sm:flex">
              {highlights.mvp.length ? (
                <span className="flex items-center gap-0.5 text-amber-500">
                  <Crown className="size-2.5 shrink-0" />
                  <span className="truncate text-xs">
                    {highlights.mvp.join(", ")}
                  </span>
                </span>
              ) : null}
              {highlights.topScorer ? (
                <span className="flex items-center gap-0.5 text-primary">
                  <Goal className="size-2.5 shrink-0" />
                  <span className="truncate text-xs">
                    {highlights.topScorer.name} ({highlights.topScorer.value})
                  </span>
                </span>
              ) : null}
              {highlights.topAssist ? (
                <span className="flex items-center gap-0.5 text-muted-foreground">
                  <Handshake className="size-2.5 shrink-0" />
                  <span className="truncate text-xs">
                    {highlights.topAssist.name} ({highlights.topAssist.value})
                  </span>
                </span>
              ) : null}
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
            ) : null}
          </div>
        ) : null}
          </div>
        </TooltipTrigger>
        {/* Hover anywhere on the cell to preview the voter list. */}
        {players > 0 ? (
          <TooltipContent className="max-w-64 border bg-popover text-popover-foreground">
            <VoterRows votes={votes} />
          </TooltipContent>
        ) : null}
      </Tooltip>
    );
  };
  return DayCell;
};
