import { Star, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { PlayerModel } from "@/types";

export type PlayerTokenProps = {
  player?: PlayerModel;
  isCaptain?: boolean;
  // Interactive extras (edit mode only).
  onToggleCaptain?: () => void;
  onRemove?: () => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  dragging?: boolean;
  interactive?: boolean;
  className?: string;
};

const avatarOf = (p?: PlayerModel) => p?.avatarNoBg || p?.avatarUrl || undefined;
const firstName = (name: string) => name.trim().split(/\s+/).pop() ?? name;

// A single on-pitch token: circular avatar + jersey number + name label. Used by
// the builder (interactive: draggable, with captain/remove controls) and by the
// read-only public view.
export const PlayerToken = ({
  player,
  isCaptain,
  onToggleCaptain,
  onRemove,
  onPointerDown,
  dragging,
  interactive,
  className,
}: PlayerTokenProps) => {
  const empty = !player;

  return (
    <div
      className={cn(
        "group/token flex w-16 flex-col items-center gap-1 sm:w-[4.5rem]",
        interactive && !empty && "cursor-grab active:cursor-grabbing",
        dragging && "opacity-40",
        className
      )}
      style={interactive ? { touchAction: "none" } : undefined}
      onPointerDown={empty ? undefined : onPointerDown}
    >
      <div className="relative">
        <Avatar
          className={cn(
            "size-12 border-2 shadow-md sm:size-14",
            empty
              ? "border-dashed border-white/60 bg-black/20"
              : "border-white bg-emerald-950/40",
            isCaptain && "ring-2 ring-yellow-400 ring-offset-1 ring-offset-emerald-800"
          )}
        >
          <AvatarImage src={avatarOf(player)} className="object-cover" />
          <AvatarFallback className="bg-emerald-900 text-sm font-semibold text-white">
            {empty ? "+" : player.fullName.charAt(0)}
          </AvatarFallback>
        </Avatar>

        {/* Jersey number */}
        {!empty && player.jerseyNumber != null ? (
          <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow">
            {player.jerseyNumber}
          </span>
        ) : null}

        {/* Captain star */}
        {isCaptain ? (
          <span className="absolute -left-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-yellow-400 text-yellow-950 shadow">
            <Star className="size-3 fill-current" />
          </span>
        ) : null}

        {/* Edit controls */}
        {interactive && !empty ? (
          <div className="absolute -top-2 right-0 flex translate-x-full gap-0.5 opacity-0 transition-opacity group-hover/token:opacity-100">
            <button
              type="button"
              aria-label={isCaptain ? "Bỏ đội trưởng" : "Đặt làm đội trưởng"}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onToggleCaptain}
              className={cn(
                "flex size-5 items-center justify-center rounded-full border border-white/70 bg-black/60 text-white hover:bg-black/80",
                isCaptain && "bg-yellow-400 text-yellow-950"
              )}
            >
              <Star className="size-3" />
            </button>
            <button
              type="button"
              aria-label="Bỏ khỏi đội hình"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onRemove}
              className="flex size-5 items-center justify-center rounded-full border border-white/70 bg-black/60 text-white hover:bg-red-500"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : null}
      </div>

      {!empty ? (
        <span className="max-w-full truncate rounded bg-black/55 px-1.5 py-0.5 text-center text-[10px] font-medium leading-tight text-white">
          {firstName(player.fullName)}
        </span>
      ) : null}
    </div>
  );
};
