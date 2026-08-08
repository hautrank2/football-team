"use client";

import { CalendarCheck, ClipboardList, LayoutDashboard, LogIn, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts";
import { loginRedirectHref } from "@/utils/routing";

// Right-side header action: login when signed out; an avatar dropdown (profile +
// logout) plus an admin shortcut when signed in.
const HeaderAuth = () => {
  const { user, isReady, isAdmin, logout } = useAuth();
  const router = useRouter();

  // Avoid a flash before localStorage is read.
  if (!isReady) return null;

  if (!user) {
    return (
      <Button
        asChild
        size="sm"
        className="group shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/40"
      >
        <Link href={loginRedirectHref()}>
          <LogIn className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          Đăng nhập
        </Link>
      </Button>
    );
  }

  const name = user.fullName || user.username;

  const onLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex items-center gap-2">
      {isAdmin ? (
        <Button asChild variant="outline" size="sm">
          <Link href="/admin">
            <LayoutDashboard className="size-4" />
            Quản trị
          </Link>
        </Button>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Tài khoản"
            className="group flex items-center gap-2 rounded-full p-1 outline-none transition-colors hover:bg-accent focus-visible:ring-1 focus-visible:ring-ring"
          >
            <Avatar className="size-8 ring-2 ring-transparent transition-all duration-300 group-hover:ring-primary/60 group-data-[state=open]:ring-primary">
              <AvatarImage src={user.avatarUrl ?? undefined} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="hidden max-w-32 truncate text-sm sm:inline">{name}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="truncate">{name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="size-4" />
              Trang cá nhân
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/lineup">
              <ClipboardList className="size-4" />
              Đội hình của tôi
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/my-matches">
              <CalendarCheck className="size-4" />
              Trận đấu của tôi
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onLogout} className="text-destructive focus:text-destructive">
            <LogOut className="size-4" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default HeaderAuth;
