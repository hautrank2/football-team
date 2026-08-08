"use client";

import { CalendarPlus, LogIn } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { loginRedirectHref } from "@/utils/routing";

// Shown while the user isn't signed in — shared by the month & week views. The
// login link carries ?redirect=<current url> so the user lands back here (with
// the same ?week/?month) after signing in.
export const LoginGate = () => (
  <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center">
    <CalendarPlus className="size-12 text-muted-foreground" />
    <h1 className="text-2xl font-semibold">Lịch đấu</h1>
    <p className="text-muted-foreground">Đăng nhập để vote ngày bạn muốn chơi.</p>
    <Button asChild>
      <Link href={loginRedirectHref()}>
        <LogIn className="size-4" />
        Đăng nhập
      </Link>
    </Button>
  </div>
);

// Colour key for the calendar / week cards.
export const Legend = () => (
  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
    <span className="flex items-center gap-1.5">
      <span className="size-3 rounded-sm bg-emerald-500/40" /> Có thể vote
    </span>
    <span className="flex items-center gap-1.5">
      <span className="size-3 rounded-sm bg-primary/25" /> Đã vote
    </span>
    <span className="flex items-center gap-1.5">
      <span className="size-3 rounded-sm ring-1 ring-primary" /> Đã chốt trận
    </span>
  </div>
);
