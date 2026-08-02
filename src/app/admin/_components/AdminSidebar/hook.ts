"use client";

import { Shield, Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useAuth } from "@/contexts";

export const useAdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const items = useMemo(
    () => [
      { href: "/admin/teams", label: "Teams", icon: Shield },
      { href: "/admin/players", label: "Players", icon: Users },
    ],
    []
  );

  const isActive = useCallback((href: string) => pathname.startsWith(href), [pathname]);

  const onLogout = useCallback(() => {
    logout();
    router.push("/login");
  }, [logout, router]);

  return { items, isActive, user, onLogout };
};
