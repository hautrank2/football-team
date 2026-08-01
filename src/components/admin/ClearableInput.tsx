"use client";

import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Input for optional fields: shows a Clear (X) button when it has a value
// (api-conventions is unrelated; this satisfies the form rule: optional → Clear).
export type ClearableInputProps = React.ComponentProps<typeof Input> & {
  onClear: () => void;
};

export const ClearableInput = ({ onClear, value, disabled, className, ...rest }: ClearableInputProps) => (
  <div className="relative">
    <Input value={value} disabled={disabled} className={cn("pr-8", className)} {...rest} />
    {!disabled && value ? (
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    ) : null}
  </div>
);
