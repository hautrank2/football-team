"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { ADMIN_NAV } from "@/constants";
import { useAuth } from "@/contexts";

export const useAdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const items = ADMIN_NAV;

  const isActive = useCallback((href: string) => pathname.startsWith(href), [pathname]);

  const onLogout = useCallback(() => {
    logout();
    router.push("/login");
  }, [logout, router]);

  return { items, isActive, user, onLogout };
};
