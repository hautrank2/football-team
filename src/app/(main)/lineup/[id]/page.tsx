"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LineupForm } from "@/components/lineup";
import { NotFound } from "@/components/ui/pages";
import { useEditLineupPage } from "./hook";

const EditLineupPage = () => {
  const s = useEditLineupPage();

  if (s.isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-center text-muted-foreground">Đang tải…</div>
    );
  }

  if (s.isError || !s.lineup) {
    return (
      <NotFound
        title="Không tìm thấy đội hình"
        description="Đội hình này không tồn tại hoặc đã bị xóa."
        action={
          <Button asChild>
            <Link href="/lineup">Về danh sách</Link>
          </Button>
        }
      />
    );
  }

  // Non-owners are redirected in the hook; render nothing meanwhile.
  if (!s.isOwner || !s.user) return null;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:px-8">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/lineup" aria-label="Quay lại">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Sửa đội hình</h1>
      </div>

      <LineupForm mode="edit" ownerId={s.user.id} initial={s.lineup} />
    </div>
  );
};

export default EditLineupPage;
