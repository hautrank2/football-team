"use client";

import { Frame, Loader2, MousePointer2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePlayers } from "@/hooks";
import { playerTitleLabel } from "@/lib/player-meta";
import type { PlayerModel } from "@/types";

// three.js only loads once the room is actually being shown.
const GalleryScene = dynamic(
  () =>
    import("@/components/exhibition/GalleryScene").then((m) => m.GalleryScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex size-full items-center justify-center">
        <Loader2 className="size-7 animate-spin text-white/50" />
      </div>
    ),
  },
);

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

const ExhibitionPage = () => {
  const router = useRouter();
  const { data, isLoading } = usePlayers({ page: 1, pageSize: 200 });
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState<PlayerModel | null>(null);

  useEffect(() => setWebgl(detectWebGL()), []);

  const players = useMemo(() => data?.items ?? [], [data]);

  const onOpen = useCallback(
    (player: PlayerModel) => router.push(`/player/${player.id}`),
    [router],
  );

  return (
    // The room takes the whole viewport under the fixed 4rem header — no page
    // container, no heading. dvh rather than vh so a phone's collapsing address
    // bar doesn't leave a gap or force a scroll.
    <div className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden bg-[#05070c]">
      {isLoading || webgl === null ? (
        <div className="flex size-full items-center justify-center">
          <Loader2 className="size-7 animate-spin text-white/50" />
        </div>
      ) : webgl === false ? (
        <div className="flex size-full flex-col items-center justify-center gap-2 px-6 text-center">
          <Frame className="size-10 text-white/40" />
          <p className="font-medium text-white">Thiết bị không hỗ trợ 3D</p>
          <p className="max-w-sm text-sm text-white/55">
            Trình duyệt này không bật được WebGL. Bạn xem danh sách cầu thủ ở
            trang Cầu thủ nhé.
          </p>
        </div>
      ) : (
        <>
          <GalleryScene
            players={players}
            onOpen={onOpen}
            onHover={setHovered}
          />

          {/* Hover read-out, as HTML over the canvas — cheaper and sharper than
              drawing it into the scene. */}
          {hovered ? (
            <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg border border-white/15 bg-black/65 px-3.5 py-2.5 backdrop-blur">
              <div className="text-base font-bold uppercase tracking-tight text-white">
                {hovered.fullName}
              </div>
              {hovered.nickname ? (
                <div className="text-sm text-amber-300">{`"${hovered.nickname}"`}</div>
              ) : null}
              <div className="text-xs text-white/60">
                {playerTitleLabel(hovered.title)}
              </div>
            </div>
          ) : null}

          <div className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-[11px] text-white/60 backdrop-blur">
            <MousePointer2 className="size-3" />
            Kéo để nhìn quanh · cuộn để tiến lại gần · bấm vào ảnh để mở hồ sơ
          </div>
        </>
      )}
    </div>
  );
};

export default ExhibitionPage;
