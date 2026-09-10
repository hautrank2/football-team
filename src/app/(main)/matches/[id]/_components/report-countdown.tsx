"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

// "2 ngày 11:04:37" while there are days left, "11:04:37" on the last day.
const formatLeft = (ms: number): string => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const clock = `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  return days > 0 ? `${days} ngày ${clock}` : clock;
};

const URGENT_MS = 12 * 60 * 60 * 1000;

// Live "how long is left" for the post-match report window. Ticks every second
// and turns amber inside the last 12 hours.
//
// The first render deliberately shows nothing measurable: the server has no way
// to know the client's clock, so rendering a real number here would be a
// hydration mismatch. An invisible placeholder of the same shape holds the space
// until the first tick lands.
export const ReportCountdown = ({ deadline }: { deadline: Date }) => {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(deadline.getTime() - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  if (left === null)
    return <span className="invisible tabular-nums">00:00:00</span>;

  if (left <= 0) return <span className="font-semibold">đã hết hạn</span>;

  return (
    <span
      className={cn(
        "font-semibold tabular-nums",
        left <= URGENT_MS && "text-amber-500",
      )}
    >
      {formatLeft(left)}
    </span>
  );
};

// A quietly pulsing dot, to say "this number is live".
export const PulseDot = ({ className }: { className?: string }) => (
  <span className={cn("relative mt-1 flex size-2 shrink-0", className)}>
    <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:animate-none" />
    <span className="relative inline-flex size-2 rounded-full bg-primary" />
  </span>
);
