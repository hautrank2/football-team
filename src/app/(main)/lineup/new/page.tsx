"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LineupForm } from "@/components/lineup";
import { NotFound } from "@/components/ui/pages";
import { useAuth } from "@/contexts";
import { useLineups } from "@/hooks";
import { MAX_LINEUPS_PER_OWNER } from "@/lib/lineup-meta";

const NewLineupPage = () => {
  const router = useRouter();
  const { user, isReady } = useAuth();

  useEffect(() => {
    if (isReady && !user) router.replace("/login");
  }, [isReady, user, router]);

  // Enforce the per-player cap before showing the builder.
  const countQuery = useLineups(
    { ownerId: user?.id, pageSize: 1, sortBy: "updatedAt", order: "desc" },
    !!user
  );
  const total = countQuery.data?.total ?? 0;
  const atLimit = countQuery.isSuccess && total >= MAX_LINEUPS_PER_OWNER;

  if (!isReady || !user || countQuery.isPending) return null;

  if (atLimit) {
    return (
      <NotFound
        title="Đã đạt giới hạn"
        description={`Mỗi người chỉ được tạo tối đa ${MAX_LINEUPS_PER_OWNER} đội hình. Hãy xóa bớt trước khi tạo mới.`}
        action={
          <Button asChild>
            <Link href="/lineup">Về danh sách</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:px-8">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/lineup" aria-label="Quay lại">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Tạo đội hình</h1>
      </div>

      <LineupForm mode="create" ownerId={user.id} />
    </div>
  );
};

export default NewLineupPage;
