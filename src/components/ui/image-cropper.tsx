"use client";

import { Loader2, Move, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const VIEWPORT = 288; // px — the square crop frame
const OUTPUT = 512; // px — exported square image
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

export type ImageCropperDialogProps = {
  open: boolean;
  src: string | null;
  fileName?: string;
  loading?: boolean;
  onCancel: () => void;
  onCropped: (file: File) => void;
};

// Square avatar cropper. The frame is fixed; the user pans (drag) and zooms
// (slider / wheel) the image beneath it. On confirm, the visible square region is
// rendered to a canvas and returned as a JPEG File.
export const ImageCropperDialog = ({
  open,
  src,
  fileName,
  loading,
  onCancel,
  onCropped,
}: ImageCropperDialogProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
    x: number;
    y: number;
  } | null>(null);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [crop, setCrop] = useState({ x: 0, y: 0 });

  // Base scale makes the image "cover" the square at zoom 1; zoom scales further.
  const baseScale = nat ? Math.max(VIEWPORT / nat.w, VIEWPORT / nat.h) : 1;
  const scale = baseScale * zoom;
  const dispW = nat ? nat.w * scale : VIEWPORT;
  const dispH = nat ? nat.h * scale : VIEWPORT;

  // Keep the image covering the frame: clamp pan to the overflow on each axis.
  const clampFor = useCallback(
    (x: number, y: number, z: number) => {
      if (!nat) return { x: 0, y: 0 };
      const s = baseScale * z;
      const mx = Math.max(0, (nat.w * s - VIEWPORT) / 2);
      const my = Math.max(0, (nat.h * s - VIEWPORT) / 2);
      return { x: clamp(x, -mx, mx), y: clamp(y, -my, my) };
    },
    [nat, baseScale]
  );

  const onLoad = () => {
    const el = imgRef.current;
    if (!el) return;
    setNat({ w: el.naturalWidth, h: el.naturalHeight });
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const changeZoom = (z: number) => {
    const nz = clamp(z, MIN_ZOOM, MAX_ZOOM);
    setZoom(nz);
    setCrop((c) => clampFor(c.x, c.y, nz));
  };

  // Write the pan straight to the DOM during a drag — no React re-render per
  // pointer move, so dragging stays smooth. State is committed once on release.
  const applyTransform = (x: number, y: number) => {
    const el = imgRef.current;
    if (el) {
      el.style.transform = `translate3d(${(VIEWPORT - dispW) / 2 + x}px, ${
        (VIEWPORT - dispH) / 2 + y
      }px, 0)`;
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!nat) return;
    e.preventDefault(); // avoid native image-drag / text selection (a source of jank)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseX: crop.x,
      baseY: crop.y,
      x: crop.x,
      y: crop.y,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore — capture is a nicety, dragging still works without it
    }
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const { x, y } = clampFor(d.baseX + (e.clientX - d.startX), d.baseY + (e.clientY - d.startY), zoom);
    d.x = x;
    d.y = y;
    applyTransform(x, y);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (d) setCrop({ x: d.x, y: d.y });
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // pointer may not be captured (e.g. cancel) — ignore
    }
  };
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    changeZoom(zoom - e.deltaY * 0.0015);
  };

  const onConfirm = () => {
    const el = imgRef.current;
    if (!el || !nat) return;

    const left = (VIEWPORT - dispW) / 2 + crop.x;
    const top = (VIEWPORT - dispH) / 2 + crop.y;
    // Map the frame's top-left back into natural image coordinates.
    const sx = -left / scale;
    const sy = -top / scale;
    const size = VIEWPORT / scale;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(el, sx, sy, size, size, 0, 0, OUTPUT, OUTPUT);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const base = fileName?.replace(/\.[^.]+$/, "") || "avatar";
        onCropped(new File([blob], `${base}.jpg`, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !loading && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Cắt ảnh đại diện</DialogTitle>
          <DialogDescription className="flex items-center gap-1.5">
            <Move className="size-3.5" />
            Kéo để di chuyển, cuộn hoặc dùng thanh trượt để phóng to.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div
            className="relative touch-none overflow-hidden rounded-md border bg-muted"
            style={{ width: VIEWPORT, height: VIEWPORT, cursor: dragRef.current ? "grabbing" : "grab" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onContextMenu={(e) => e.preventDefault()}
            onWheel={onWheel}
          >
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imgRef}
                src={src}
                alt=""
                onLoad={onLoad}
                draggable={false}
                className="pointer-events-none absolute left-0 top-0 max-w-none select-none"
                style={{
                  width: dispW,
                  height: dispH,
                  transform: `translate3d(${(VIEWPORT - dispW) / 2 + crop.x}px, ${
                    (VIEWPORT - dispH) / 2 + crop.y
                  }px, 0)`,
                  willChange: "transform",
                }}
              />
            ) : null}
            {/* Rule-of-thirds guides over the square crop */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-y-0 left-1/3 w-px bg-white/30" />
              <div className="absolute inset-y-0 left-2/3 w-px bg-white/30" />
              <div className="absolute inset-x-0 top-1/3 h-px bg-white/30" />
              <div className="absolute inset-x-0 top-2/3 h-px bg-white/30" />
            </div>
          </div>

          <div className="flex w-full items-center gap-3">
            <ZoomOut className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              onChange={(e) => changeZoom(Number(e.target.value))}
              className="w-full cursor-pointer accent-primary"
              aria-label="Phóng to / thu nhỏ"
            />
            <ZoomIn className="size-4 shrink-0 text-muted-foreground" />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Hủy
          </Button>
          <Button type="button" onClick={onConfirm} disabled={loading || !nat}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {loading ? "Đang tải…" : "Cắt & lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
