import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PitchFieldProps = {
  children?: ReactNode;
  className?: string;
};

// Presentational football pitch (portrait, attacking goal at the top). Renders
// the turf + white markings; callers absolutely-position tokens as children at
// `left: x%`, `top: y%`. The forwarded ref points at the field box so drag logic
// can measure it with getBoundingClientRect().
export const PitchField = forwardRef<HTMLDivElement, PitchFieldProps>(
  ({ children, className }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative aspect-[2/3] w-full select-none overflow-hidden rounded-xl border border-emerald-950/50 shadow-inner",
        className
      )}
      style={{ backgroundColor: "#15803d" }}
    >
      {/* Mowing stripes */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 8.333%, rgba(0,0,0,0.05) 8.333% 16.666%)",
        }}
      />

      {/* Markings */}
      <div className="pointer-events-none absolute inset-[3%] rounded-sm border-2 border-white/70">
        {/* Halfway line */}
        <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-white/70" />
        {/* Center circle + spot */}
        <div className="absolute left-1/2 top-1/2 size-[26%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/70" />
        <div className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70" />

        {/* Top (attacking) penalty + goal area */}
        <div className="absolute left-1/2 top-0 h-[16%] w-[58%] -translate-x-1/2 border-2 border-t-0 border-white/70" />
        <div className="absolute left-1/2 top-0 h-[7%] w-[30%] -translate-x-1/2 border-2 border-t-0 border-white/70" />
        <div className="absolute left-1/2 top-[-1px] h-[3%] w-[16%] -translate-x-1/2 border-2 border-t-0 border-white/90" />

        {/* Bottom (own) penalty + goal area */}
        <div className="absolute bottom-0 left-1/2 h-[16%] w-[58%] -translate-x-1/2 border-2 border-b-0 border-white/70" />
        <div className="absolute bottom-0 left-1/2 h-[7%] w-[30%] -translate-x-1/2 border-2 border-b-0 border-white/70" />
        <div className="absolute bottom-[-1px] left-1/2 h-[3%] w-[16%] -translate-x-1/2 border-2 border-b-0 border-white/90" />
      </div>

      {children}
    </div>
  )
);

PitchField.displayName = "PitchField";
