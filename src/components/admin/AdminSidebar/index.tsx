"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminSidebar } from "./hook";
import type { AdminSidebarProps } from "./type";

export type { AdminSidebarProps };

export const AdminSidebar = () => {
  const { items, isActive, user, onLogout } = useAdminSidebar();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r bg-card sticky top-0">
      <div className="flex h-16 items-center border-b px-6 text-lg font-semibold uppercase">
        Admin
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
              isActive(href) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t p-3">
        <div className="mb-2 truncate px-2 text-sm text-muted-foreground">
          {user?.fullName ?? user?.username}
        </div>
        <Button variant="outline" size="sm" className="w-full justify-start" onClick={onLogout}>
          <LogOut className="size-4" />
          Đăng xuất
        </Button>
      </div>
    </aside>
  );
};
