"use client";

import { LayoutDashboard, LogIn, LogOut, User } from "lucide-react";
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

// Right-side header action: login when signed out; an avatar dropdown (profile +
// logout) plus an admin shortcut when signed in.
const HeaderAuth = () => {
  const { user, isReady, logout } = useAuth();
  const router = useRouter();

  // Avoid a flash before localStorage is read.
  if (!isReady) return null;

  if (!user) {
    return (
      <Button asChild size="sm">
        <Link href="/login">
          <LogIn className="size-4" />
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
      {user.role === "ADMIN" ? (
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
            className="flex items-center gap-2 rounded-md p-1 outline-none transition-colors hover:bg-accent focus-visible:ring-1 focus-visible:ring-ring"
          >
            <Avatar className="size-8">
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
