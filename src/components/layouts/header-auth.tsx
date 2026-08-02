"use client";

import { LayoutDashboard, LogIn } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts";

// Right-side header action: login when signed out, dashboard link when signed in.
const HeaderAuth = () => {
  const { user, isReady } = useAuth();

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

  return (
    <Button asChild variant="outline" size="sm">
      <Link href="/admin">
        <LayoutDashboard className="size-4" />
        {user.fullName || user.username}
      </Link>
    </Button>
  );
};

export default HeaderAuth;
