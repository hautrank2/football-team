"use client";

import { CheckCircle2, Crown, Goal, Handshake, Users } from "lucide-react";
import Link from "next/link";
import { PlayerStage } from "@/components/player/player-stage";
import { TiltCard } from "@/components/player/tilt-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatVnd } from "@/lib/format";
import { cardAccent } from "@/lib/player-card-theme";
import { cn } from "@/lib/utils";
import type { MatchPlayerModel } from "@/types";

// One participant of a match, drawn on the same stage as the home/squad cards
// so the two pages read as one system — plus what only matters here: the
// match's goals/assists, the money split, and the MVP ballot.
export const ParticipantCard = ({
  p,
  isMe,
  isMvp,
  votedForThem,
  canVote,
  isVoting,
  onVote,
}: {
  p: MatchPlayerModel;
  isMe: boolean;
  isMvp: boolean;
  votedForThem: boolean;
  canVote: boolean;
  isVoting: boolean;
  onVote: () => void;
}) => {
  const player = p.player;
  const name = player?.fullName ?? player?.username ?? p.playerId;
  const accent = cardAccent(player?.positions);

  return (
    // Same 3D shell as the squad cards, so the two pages tilt alike: the card
    // tilts as one piece, with nothing riding at its own depth (see squad-card).
    <TiltCard>
      <div
        className={cn(
          "group relative flex size-full flex-col overflow-hidden border bg-card shadow-sm transition-all duration-300",
          "hover:shadow-xl",
          votedForThem
            ? "border-amber-500/70 shadow-amber-500/10"
            : "hover:border-primary/50",
          accent.glow,
        )}
      >
        {/* Stage — the card's picture, same proportions as the squad cards. */}
        {player ? (
          <Link href={`/player/${player.id}`} className="block">
            <PlayerStage
              player={player}
              imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            >
              {isMvp ? (
                <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950 shadow-md">
                  <Crown className="size-3" />
                  MVP
                </span>
              ) : null}
              {isMe ? (
                <Badge
                  variant="secondary"
                  className="absolute right-2.5 top-2.5 h-5 px-1.5 text-[10px] font-semibold shadow"
                >
                  Bạn
                </Badge>
              ) : null}
            </PlayerStage>
          </Link>
        ) : (
          <div className="flex aspect-[3/4] items-center justify-center bg-muted text-muted-foreground">
            ?
          </div>
        )}

        {/* Info */}
        <div className="flex flex-1 flex-col gap-2 px-3 pb-3 pt-1">
          <div>
            <div
              className="truncate font-bold uppercase tracking-tight"
              title={name}
            >
              {name}
            </div>
            {player?.nickname ? (
              <div className={cn("truncate text-sm font-medium", accent.text)}>
                {`"${player.nickname}"`}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Goal className="size-3.5" />
              <span className="font-semibold text-foreground">
                {p.goals}
              </span>{" "}
              bàn
            </span>
            <span className="inline-flex items-center gap-1">
              <Handshake className="size-3.5" />
              <span className="font-semibold text-foreground">
                {p.assists}
              </span>{" "}
              kiến tạo
            </span>
            {p.guestCount ? (
              <span className="inline-flex items-center gap-1">
                <Users className="size-3.5" />+{p.guestCount}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            {p.amountDue ? (
              <>
                <span className="font-semibold">{formatVnd(p.amountDue)}</span>
                <Badge
                  variant={p.isPaid ? "default" : "outline"}
                  className="h-5 px-1.5 text-[10px]"
                >
                  {p.isPaid ? "Đã trả" : "Chưa trả"}
                </Badge>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">
                Chưa chia tiền
              </span>
            )}
          </div>

          {canVote ? (
            <Button
              size="sm"
              className="mt-auto w-full"
              variant={votedForThem ? "default" : "outline"}
              disabled={isVoting}
              onClick={onVote}
            >
              {votedForThem ? (
                <>
                  <CheckCircle2 className="size-4" />
                  Đã Vote
                </>
              ) : (
                <>
                  <Crown className="size-4" />
                  Vote MVP
                </>
              )}
            </Button>
          ) : null}
        </div>
      </div>
    </TiltCard>
  );
};
