"use client";

import { Hexagon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/utils/routing";
import HeaderAuth from "./header-auth";
import Nav from "./nav";

// Scroll-aware header: transparent + soft scrim while sitting over the hero,
// then a blurred, bordered bar once the page scrolls. Entrance slides in on mount.
const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-30 flex h-16 w-full items-center justify-between px-4 lg:px-16",
        "animate-in fade-in slide-in-from-top-4 duration-500",
        "transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/70 shadow-lg shadow-black/20 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      {/* Soft top scrim for legibility over the hero — fades out once scrolled. */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background/70 to-transparent transition-opacity duration-300",
          scrolled ? "opacity-0" : "opacity-100"
        )}
      />

      <Link href={ROUTES.home} className="header-brand group flex items-center gap-2.5">
        <span className="relative flex size-9 items-center justify-center">
          <Hexagon
            strokeWidth={2.2}
            className="size-7 text-primary transition-transform duration-500 ease-out group-hover:rotate-[30deg] group-hover:scale-110"
          />
          {/* Glow that blooms on hover */}
          <span className="absolute inset-0 -z-10 rounded-full bg-primary/40 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100" />
        </span>
        <span className="brand-shine text-2xl font-bold uppercase tracking-wide">App</span>
      </Link>

      <div className="flex items-center gap-3">
        <Nav />
        <HeaderAuth />
      </div>
    </header>
  );
};

export default Header;
