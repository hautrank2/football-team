"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/utils/routing";

type NavItem = { title: string; href: string };

const NAV_ITEMS: NavItem[] = [
  { title: "Home", href: ROUTES.home },
  { title: "Cầu thủ", href: ROUTES.players },
  { title: "Đội hình", href: ROUTES.lineups },
];

const Nav = () => {
  const pathname = usePathname();

  // Desktop link: animated underline that grows from the left; stays lit when active.
  const desktopLink = (item: NavItem) => {
    const active = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "group relative rounded-md px-3 py-1.5 text-lg font-medium transition-colors duration-200",
          active ? "text-primary" : "text-foreground/70 hover:text-foreground"
        )}
      >
        {item.title}
        <span
          className={cn(
            "pointer-events-none absolute inset-x-2 -bottom-0.5 h-0.5 origin-left rounded-full bg-primary transition-transform duration-300 ease-out",
            active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
          )}
        />
      </Link>
    );
  };

  // Mobile link: fills with primary + slides right on hover, staggered on open.
  const mobileLink = (item: NavItem, index: number) => {
    const active = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        style={{ animationDelay: `${index * 60 + 120}ms` }}
        className={cn(
          "animate-in fade-in slide-in-from-right-4 fill-mode-both duration-300",
          "group flex items-center gap-2 rounded-md px-6 py-3 text-xl font-medium transition-all duration-200",
          "hover:translate-x-1 hover:bg-primary hover:text-background",
          active && "bg-primary/15 text-primary"
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full bg-primary transition-all duration-200 group-hover:bg-background",
            active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        />
        {item.title}
      </Link>
    );
  };

  return (
    <div className="header-extra">
      <nav className="hidden items-center gap-1 md:flex">
        {NAV_ITEMS.map(desktopLink)}
      </nav>

      <Sheet>
        <SheetTrigger
          aria-label="Mở menu"
          className="group flex size-9 items-center justify-center rounded-md text-foreground/80 transition-colors hover:bg-accent hover:text-foreground md:hidden"
        >
          <Menu className="size-5 transition-transform duration-300 group-hover:scale-110 group-data-[state=open]:rotate-90" />
        </SheetTrigger>
        <SheetContent className="w-[300px] sm:w-[380px]">
          <SheetHeader>
            <SheetTitle className="brand-shine text-2xl font-bold uppercase tracking-wide">
              App
            </SheetTitle>
            <SheetDescription className="sr-only">Điều hướng</SheetDescription>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-2 py-6">
            {NAV_ITEMS.map(mobileLink)}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Nav;
