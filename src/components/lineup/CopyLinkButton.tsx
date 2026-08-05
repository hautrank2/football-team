"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  /** Lineup id — the shared link points at the public view page. */
  lineupId: string;
  label?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
  "aria-label"?: string;
};

// Copies the public view URL (/lineups/:id) to the clipboard. Used on the
// "my lineups" surfaces so an owner can quickly share a lineup.
export const CopyLinkButton = ({
  lineupId,
  label = "Copy link",
  variant = "outline",
  size = "sm",
  className,
  "aria-label": ariaLabel,
}: Props) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const url = `${window.location.origin}/lineups/${lineupId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Đã copy link đội hình");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can be blocked (insecure context / permissions).
      toast.error("Không thể copy, hãy thử lại");
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={copy}
      aria-label={ariaLabel}
      className={cn(className)}
    >
      {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
      {label ? <span>{label}</span> : null}
    </Button>
  );
};
