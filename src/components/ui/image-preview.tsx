"use client";

import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type ImagePreviewProps = {
  src?: string | null;
  alt?: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
};

// Wraps any avatar/thumbnail so clicking it opens a full-size preview. The trigger
// is a <span role="button"> (not a <button>) so it stays valid HTML even when the
// avatar sits inside a link. With no src (or disabled) it renders children as-is.
export const ImagePreview = ({ src, alt, children, className, disabled }: ImagePreviewProps) => {
  const [open, setOpen] = useState(false);

  if (!src || disabled) return <>{children}</>;

  const openPreview = (e: React.SyntheticEvent) => {
    // Avoid triggering a surrounding link/card.
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        aria-label={alt ? `Xem ảnh ${alt}` : "Xem ảnh"}
        onClick={openPreview}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") openPreview(e);
        }}
        className={cn("inline-flex cursor-zoom-in", className)}
      >
        {children}
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="flex w-auto max-w-[95vw] items-center justify-center border-0 bg-transparent p-0 shadow-none"
          onClick={() => setOpen(false)}
        >
          <DialogTitle className="sr-only">{alt || "Ảnh"}</DialogTitle>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt || ""}
            className="max-h-[85vh] max-w-[95vw] rounded-xl object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
