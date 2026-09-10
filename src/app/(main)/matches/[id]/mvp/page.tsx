"use client";

import { format } from "date-fns";
import { ArrowLeft, Crown, Download, Loader2, Share2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { MvpPoster, POSTER_H, POSTER_W } from "./_components/mvp-poster";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMatch } from "@/hooks/schedule";
import { topByStat } from "@/lib/match";
import { matchHref } from "@/utils/routing";

const errMsg = (e: unknown) =>
  String((e as { message?: unknown })?.message ?? "Lỗi");

// html-to-image finishes inside a requestAnimationFrame, and browsers stop
// firing those for a hidden tab — so an export started and then backgrounded
// never settles. Rather than spin forever, give up and say why.
const RENDER_TIMEOUT_MS = 30_000;

const withTimeout = <T,>(work: Promise<T>, ms: number, message: string) =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });

// Render the poster node to a PNG at twice its CSS size (1080×1440). The
// explicit width/height keep the export independent of the preview's scale.
const renderPoster = async (node: HTMLElement): Promise<Blob> => {
  const { toBlob } = await import("html-to-image");
  const blob = await withTimeout(
    toBlob(node, {
      pixelRatio: 2,
      width: POSTER_W,
      height: POSTER_H,
      cacheBust: true,
      style: { transform: "none" },
    }),
    RENDER_TIMEOUT_MS,
    "Tạo ảnh quá lâu. Hãy giữ trang này hiển thị (đừng chuyển tab) rồi thử lại.",
  );
  if (!blob) throw new Error("Không tạo được ảnh");
  return blob;
};

const MatchMvpPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: match, isLoading } = useMatch(id);

  const posterRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [busy, setBusy] = useState<"download" | "share" | null>(null);
  const [canShareFiles, setCanShareFiles] = useState(false);

  // The poster is a fixed 540×720 box; the preview scales it down to whatever
  // width the page has. The export ignores this scale entirely.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1, el.clientWidth / POSTER_W));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [match]);

  // Web Share with files is Android/iOS-mostly; checked after mount so the
  // server and client render the same markup.
  useEffect(() => {
    setCanShareFiles(
      typeof navigator !== "undefined" &&
        typeof navigator.canShare === "function",
    );
  }, []);

  const players = useMemo(() => match?.players ?? [], [match]);
  const mvps = match?.mvpPlayers ?? [];
  const topScorers = useMemo(() => topByStat(players, "goals"), [players]);
  const topAssists = useMemo(() => topByStat(players, "assists"), [players]);
  const statsOf = useCallback(
    (playerId: string) => players.find((p) => p.playerId === playerId),
    [players],
  );

  const fileName = match
    ? `footboys-mvp-${format(new Date(match.matchDate), "dd-MM-yyyy")}.png`
    : "footboys-mvp.png";

  const onDownload = async () => {
    if (!posterRef.current) return;
    setBusy("download");
    try {
      const blob = await renderPoster(posterRef.current);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Đã lưu ảnh");
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(null);
    }
  };

  const onShare = async () => {
    if (!posterRef.current) return;
    setBusy("share");
    try {
      const blob = await renderPoster(posterRef.current);
      const file = new File([blob], fileName, { type: "image/png" });
      if (!navigator.canShare?.({ files: [file] })) {
        toast.error("Thiết bị không hỗ trợ chia sẻ ảnh — hãy bấm Tải ảnh.");
        return;
      }
      await navigator.share({
        files: [file],
        title: "MVP trận đấu",
        text: mvps.length
          ? `MVP: ${mvps.map((p) => p.fullName).join(", ")}`
          : undefined,
      });
    } catch (e) {
      // Cancelling the share sheet rejects too — that's not an error worth showing.
      if ((e as { name?: string })?.name !== "AbortError")
        toast.error(errMsg(e));
    } finally {
      setBusy(null);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="h-[520px] rounded-xl" />
      </div>
    );
  }
  if (!match) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-muted-foreground">
        Không tìm thấy trận đấu.
      </div>
    );
  }

  const back = (
    <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
      <Link href={matchHref(match.id)}>
        <ArrowLeft className="size-4" />
        Chi tiết trận đấu
      </Link>
    </Button>
  );

  if (!mvps.length) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
        {back}
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-16 text-center">
          <Crown className="size-10 text-muted-foreground" />
          <p className="font-medium">Trận này chưa có MVP</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Ảnh chia sẻ sẽ có ngay khi có người bầu chọn. Vào trang trận đấu để
            bầu MVP nhé.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-8 lg:px-8">
      {back}

      <div>
        <h1 className="text-2xl font-semibold">Ảnh chia sẻ MVP</h1>
        <p className="text-sm text-muted-foreground">
          {match.mvpFinalized === false
            ? "Bảng bầu chọn chưa chốt — ảnh đang ghi người tạm dẫn đầu."
            : "Lưu ảnh về máy rồi khoe lên nhóm nhé."}
        </p>
      </div>

      {/* Preview — a scaled-down view of exactly what gets exported. */}
      <div
        ref={frameRef}
        className="mx-auto w-full max-w-[540px] overflow-hidden rounded-xl shadow-2xl"
        style={{ height: POSTER_H * scale }}
      >
        <div
          style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
          <MvpPoster
            ref={posterRef}
            match={match}
            mvps={mvps}
            statsOf={statsOf}
            topScorers={topScorers}
            topAssists={topAssists}
            provisional={match.mvpFinalized === false}
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={onDownload} disabled={busy !== null}>
          {busy === "download" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Tải ảnh
        </Button>
        {canShareFiles ? (
          <Button
            size="lg"
            variant="outline"
            onClick={onShare}
            disabled={busy !== null}
          >
            {busy === "share" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Share2 className="size-4" />
            )}
            Chia sẻ
          </Button>
        ) : null}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Ảnh xuất ra 1080×1440 — vừa khung story lẫn bài đăng.
      </p>
    </div>
  );
};

export default MatchMvpPage;
