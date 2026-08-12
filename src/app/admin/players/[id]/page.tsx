"use client";

import { ArrowLeft, KeyRound, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { usePlayer, useResetPlayerPassword } from "@/hooks";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { ImagePreview } from "@/components/ui/image-preview";
import { PlayerForm, toFormValues } from "../_components/PlayerFormDialog";
import { PlayerRemoveBgDialog } from "@/components/player/PlayerRemoveBgDialog";

// Checkerboard so the transparent PNG's cut-out is obvious in the preview.
const CHECKER: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(45deg,#d4d4d8 25%,transparent 25%),linear-gradient(-45deg,#d4d4d8 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#d4d4d8 75%),linear-gradient(-45deg,transparent 75%,#d4d4d8 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
};

const PlayerEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: player, isPending, isError } = usePlayer(id);

  const [resetOpen, setResetOpen] = useState(false);
  const [bgOpen, setBgOpen] = useState(false);
  const resetPassword = useResetPlayerPassword();

  const confirmReset = () => {
    if (!player) return;
    resetPassword.mutate(
      { id: player.id, username: player.username },
      {
        onSuccess: () => {
          toast.success(`Đã reset mật khẩu: ${player.username}@123`);
          setResetOpen(false);
        },
        onError: () => toast.error("Không thể reset mật khẩu"),
      }
    );
  };

  const back = () => router.push("/admin/players");

  if (isPending) return <p className="text-muted-foreground">Đang tải…</p>;
  if (isError || !player) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-muted-foreground">Không tìm thấy cầu thủ.</p>
        <Button variant="outline" asChild>
          <Link href="/admin/players">
            <ArrowLeft className="size-4" />
            Về danh sách
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={back}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-2xl font-semibold">Cập nhật: {player.fullName}</h1>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto gap-2"
          onClick={() => setBgOpen(true)}
        >
          <Sparkles className="size-4" />
          Xóa nền
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setResetOpen(true)}
        >
          <KeyRound className="size-4" />
          Reset mật khẩu
        </Button>
      </div>

      {player.avatarNoBg ? (
        <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
          <ImagePreview src={player.avatarNoBg} alt="Ảnh xóa nền">
            <div
              className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-md border"
              style={CHECKER}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={player.avatarNoBg}
                alt="Ảnh xóa nền"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </ImagePreview>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Ảnh đã xóa nền</span>
            <span className="text-xs text-muted-foreground">
              Bấm “Xóa nền” để cập nhật hoặc thay ảnh.
            </span>
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border bg-card p-6">
        <PlayerForm
          key={player.id}
          isEdit
          playerId={player.id}
          defaultValues={toFormValues(player)}
          onSuccess={back}
          onCancel={back}
        />
      </div>

      <PlayerRemoveBgDialog
        open={bgOpen}
        player={player}
        onOpenChange={setBgOpen}
      />

      <DeleteDialog
        open={resetOpen}
        title="Reset mật khẩu?"
        description={`Mật khẩu của "${player.username}" sẽ được đặt lại thành ${player.username}@123.`}
        confirmLabel="Reset"
        destructive={false}
        loading={resetPassword.isPending}
        onOpenChange={(open) => !open && setResetOpen(false)}
        onConfirm={confirmReset}
      />
    </div>
  );
};

export default PlayerEditPage;
