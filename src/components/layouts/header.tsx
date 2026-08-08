"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/utils/routing";
import HeaderAuth from "./header-auth";
import Nav from "./nav";
import ThemeToggle from "./theme-toggle";

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
          : "border-b border-transparent bg-transparent",
      )}
    >
      {/* Soft top scrim for legibility over the hero — fades out once scrolled. */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background/70 to-transparent transition-opacity duration-300",
          scrolled ? "opacity-0" : "opacity-100",
        )}
      />

      <Link
        href={ROUTES.home}
        className="header-brand group flex items-center gap-2.5"
      >
        <Image src={"/images/logo.png"} alt="app_avt" width={40} height={40} />
        <span className="brand-shine text-2xl font-bold uppercase tracking-wide">
          Footboys
        </span>
      </Link>

      <div className="flex items-center gap-3">
        <Nav />
        <ThemeToggle />
        <HeaderAuth />
      </div>
    </header>
  );
};

export default Header;
