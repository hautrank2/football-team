"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { usePlayer } from "@/hooks";
import { Button } from "@/components/ui/button";
import { PlayerForm, toFormValues } from "../_components/PlayerFormDialog";

const PlayerEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: player, isPending, isError } = usePlayer(id);

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
      </div>

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
    </div>
  );
};

export default PlayerEditPage;
