"use client";

import { Box, Loader2, Square } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { LineupPitch } from "./LineupPitch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LineupSlotModel, PlayerModel } from "@/types";

const STORAGE_KEY = "FOOTBALL_PITCH_VIEW";

// three.js is ~150KB gzipped — it must never be in the bundle of a page that
// isn't showing it. Loaded only once the user actually switches to 3D.
const LineupScene = dynamic(
  () => import("./pitch-3d/LineupScene").then((m) => m.LineupScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex size-full items-center justify-center bg-[#07130d]">
        <Loader2 className="size-6 animate-spin text-white/60" />
      </div>
    ),
  },
);

// Does this browser actually have WebGL? Some old phones, locked-down browsers
// and headless environments don't, and a dead black canvas is worse than the 2D
// pitch. Probed once, lazily.
const detectWebGL = (): boolean => {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
};

export type LineupPitchViewProps = {
  slots: LineupSlotModel[];
  playersById: Map<string, PlayerModel>;
  className?: string;
};

// The read-only lineup, in 2D or on a 3D pitch you can orbit around. The choice
// is remembered per browser; 3D is the default when the device can run it.
export const LineupPitchView = ({
  slots,
  playersById,
  className,
}: LineupPitchViewProps) => {
  // Starts 2D so the server and the first client render agree; the effect below
  // upgrades to 3D once we know the device can handle it.
  const [is3D, setIs3D] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => {
    const ok = detectWebGL();
    setWebgl(ok);
    if (!ok) return;
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      // storage blocked — fall through to the default
    }
    setIs3D(stored !== "2d");
  }, []);

  const choose = (next: boolean) => {
    setIs3D(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "3d" : "2d");
    } catch {
      // storage blocked — the choice just won't persist
    }
  };

  return (
    // 2D is a portrait pitch and reads best narrow; 3D is a landscape stage and
    // wants the room. The width cap lives here so it can follow the mode.
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-2",
        is3D ? "max-w-3xl" : "max-w-md",
        className,
      )}
    >
      {webgl ? (
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex overflow-hidden rounded-md border">
            <Button
              size="sm"
              variant={is3D ? "ghost" : "secondary"}
              className="rounded-none"
              onClick={() => choose(false)}
            >
              <Square className="size-4" />
              2D
            </Button>
            <Button
              size="sm"
              variant={is3D ? "secondary" : "ghost"}
              className="rounded-none"
              onClick={() => choose(true)}
            >
              <Box className="size-4" />
              3D
            </Button>
          </div>
          {is3D ? (
            <span className="text-xs text-muted-foreground">
              Kéo để xoay · cuộn để phóng to
            </span>
          ) : null}
        </div>
      ) : null}

      {is3D ? (
        <div className="aspect-[3/4] w-full overflow-hidden rounded-xl border sm:aspect-[4/3]">
          <LineupScene slots={slots} playersById={playersById} />
        </div>
      ) : (
        <LineupPitch slots={slots} playersById={playersById} />
      )}
    </div>
  );
};
