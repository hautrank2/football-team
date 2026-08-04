"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTeam } from "@/hooks";
import { Button } from "@/components/ui/button";
import { TeamForm, toTeamFormValues } from "../_components/TeamFormDialog";

const TeamEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: team, isPending, isError } = useTeam(id);

  const back = () => router.push("/admin/teams");

  if (isPending) return <p className="text-muted-foreground">Đang tải…</p>;
  if (isError || !team) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-muted-foreground">Không tìm thấy đội.</p>
        <Button variant="outline" asChild>
          <Link href="/admin/teams">
            <ArrowLeft className="size-4" />
            Về danh sách
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={back}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-2xl font-semibold">Cập nhật: {team.name}</h1>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <TeamForm
          key={team.id}
          isEdit
          teamId={team.id}
          defaultValues={toTeamFormValues(team)}
          onSuccess={back}
          onCancel={back}
        />
      </div>
    </div>
  );
};

export default TeamEditPage;
