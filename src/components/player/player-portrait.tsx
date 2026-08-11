"use client";

import type { PlayerModel } from "@/types";
import { ImagePreview } from "@/components/ui/image-preview";
import { cn } from "@/lib/utils";

type PortraitPlayer = Pick<PlayerModel, "avatarNoBg" | "avatarUrl" | "fullName">;

export const playerImageSrc = (p: PortraitPlayer): string | undefined =>
  p.avatarNoBg || p.avatarUrl || undefined;

// Renders a player's photo with the right treatment for the source we have:
//  • avatarNoBg (transparent cutout) → object-contain + object-bottom so the
//    player "stands" on the card floor, with a drop shadow that sells the pop-out.
//  • avatarUrl (normal photo)        → object-cover crop that fills the frame.
//  • neither                         → the first letter of the name on muted bg.
// The parent owns sizing/positioning (pass it via className); this only owns the
// image itself. Set `preview` to make it click-to-zoom (safe inside a link).
export const PlayerPortrait = ({
  player,
  className,
  imgClassName,
  fallbackClassName,
  preview,
}: {
  player: PortraitPlayer;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
  preview?: boolean;
}) => {
  const src = playerImageSrc(player);
  const isCutout = !!player.avatarNoBg;

  const inner = src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={player.fullName}
      className={cn(
        "size-full select-none",
        isCutout
          ? "object-contain object-bottom drop-shadow-[0_12px_20px_rgba(0,0,0,0.35)]"
          : "object-cover",
        imgClassName,
      )}
      draggable={false}
    />
  ) : (
    <div
      className={cn(
        "flex size-full items-center justify-center bg-muted font-bold text-muted-foreground",
        fallbackClassName,
      )}
    >
      {player.fullName.charAt(0)}
    </div>
  );

  if (preview && src) {
    return (
      <ImagePreview src={src} alt={player.fullName} className={cn("size-full", className)}>
        {inner}
      </ImagePreview>
    );
  }

  return <div className={cn("relative overflow-hidden", className)}>{inner}</div>;
};
