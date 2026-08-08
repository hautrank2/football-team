"use client";

import { ArrowLeft, KeyRound, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImagePreview } from "@/components/ui/image-preview";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayers } from "@/hooks";

const UsersPage = () => {
  const [search, setSearch] = useState("");
  const query = usePlayers({
    page: 1,
    pageSize: 200,
    sortBy: "fullName",
    order: "asc",
  });

  const users = useMemo(() => {
    const items = query.data?.items ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q),
    );
  }, [query.data, search]);

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-4 py-8">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/login" aria-label="Về đăng nhập">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Danh sách tài khoản</h1>
      </div>

      {/* Password convention notice */}
      <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
        <KeyRound className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div>
          Mật khẩu mặc định là{" "}
          <code className="font-semibold">username@123</code> (ví dụ tài khoản{" "}
          <code className="font-semibold">hau.tt</code> → mật khẩu{" "}
          <code className="font-semibold">hau.tt@123</code>).{" "}
          <span className="font-semibold text-destructive">
            Vui lòng đăng nhập rồi vào trang cá nhân đổi mật khẩu ngay.
          </span>{" "}
          <span className="font-semibold text-destructive">
            Nếu đăng nhập không được, hãy liên hệ admin để reset mật khẩu.
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tài khoản cầu thủ</CardTitle>
          <CardDescription>
            Chọn tài khoản của bạn và đăng nhập.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc tài khoản…"
              className="pl-8"
            />
          </div>

          {query.isPending ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-md" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Không tìm thấy tài khoản nào
            </div>
          ) : (
            <ul className="flex flex-col divide-y">
              {users.map((u) => (
                <li key={u.id} className="flex items-center gap-3 py-2.5">
                  <ImagePreview src={u.avatarUrl} alt={u.fullName}>
                    <Avatar className="size-9 border">
                      <AvatarImage
                        src={u.avatarUrl ?? undefined}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-xs">
                        {u.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </ImagePreview>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{u.fullName}</div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
                      <span className="truncate">
                        Tài khoản:{" "}
                        <span className="font-medium text-foreground">
                          {u.username}
                        </span>
                      </span>
                      <span className="truncate">
                        Mật khẩu:{" "}
                        <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
                          {u.username}@123
                        </code>
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Button asChild className="mt-1 w-full">
            <Link href="/login">Đăng nhập</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;
