import { cn } from "@/lib/utils";
import type { LineupSlotModel, PlayerModel } from "@/types";
import { PitchField } from "./PitchField";
import { PlayerToken } from "./PlayerToken";

export type LineupPitchProps = {
  slots: LineupSlotModel[];
  playersById: Map<string, PlayerModel>;
  className?: string;
};

// Read-only pitch: renders each saved slot as a static token at its coordinates.
export const LineupPitch = ({ slots, playersById, className }: LineupPitchProps) => (
  <PitchField className={className}>
    {slots.map((slot, i) => (
      <div
        key={i}
        className={cn("absolute -translate-x-1/2 -translate-y-1/2")}
        style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
      >
        <PlayerToken player={playersById.get(slot.playerId)} isCaptain={slot.isCaptain} />
      </div>
    ))}
  </PitchField>
);
