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

const NAV_ITEMS: NavItem[] = [{ title: "Home", href: ROUTES.home }];

const linkClass =
  "hover:bg-primary hover:text-background active:bg-primary active:text-background";

const Nav = () => {
  const pathname = usePathname();

  const renderLink = (item: NavItem, padding: string) => (
    <Link
      key={item.href}
      href={item.href}
      className={cn(padding, linkClass, pathname === item.href && "bg-primary text-background")}
    >
      <h4 className="text-2xl">{item.title}</h4>
    </Link>
  );

  return (
    <div className="header-extra">
      <div className="items-center hidden md:flex gap-2">
        {NAV_ITEMS.map((item) => renderLink(item, "px-4 py-2"))}
      </div>

      <Sheet>
        <SheetTrigger className="md:hidden">
          <Menu />
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle></SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-0 py-8">
            {NAV_ITEMS.map((item) => renderLink(item, "px-8 py-2"))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Nav;
