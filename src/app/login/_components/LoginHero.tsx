"use client";

import { CalendarCheck, Crown, Trophy } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import VerticalCutReveal from "@/components/fancy/text/vertical-cut-reveal";
import { GradientText } from "@/components/ui/gradient-text";

const PERKS = [
  { icon: CalendarCheck, label: "Chốt lịch đá" },
  { icon: Crown, label: "Bầu MVP" },
  { icon: Trophy, label: "Vua phá lưới" },
];

// The left half of the login screen: the club's pitch, animated in as the page
// lands. Everything here is decoration — the form on the right is the job.
export const LoginHero = () => {
  const reduce = useReducedMotion();

  const fade = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.5, ease: "easeOut" as const },
        };

  return (
    <div className="w-full max-w-lg text-center text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)] lg:max-w-none lg:flex-1 lg:pr-8 lg:text-left">
      {/* Logo + wordmark */}
      <motion.div
        {...fade(0)}
        className="mb-5 flex items-center justify-center gap-3 lg:justify-start"
      >
        <motion.div
          animate={reduce ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          {/* Glow behind the badge */}
          <div className="absolute inset-0 -z-10 rounded-full bg-primary/40 blur-2xl" />
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={80}
            height={80}
            className="size-12 rounded lg:size-20"
            priority
          />
        </motion.div>
        <GradientText
          text="FOOTBOYS"
          neon
          gradient="linear-gradient(90deg, #60a5fa 0%, #38bdf8 25%, #ffffff 50%, #38bdf8 75%, #60a5fa 100%)"
          className="text-xl font-bold uppercase tracking-[0.3em] sm:text-2xl lg:text-6xl"
        />
      </motion.div>

      <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
        <VerticalCutReveal
          splitBy="characters"
          staggerDuration={0.018}
          staggerFrom="first"
          transition={{ type: "spring", stiffness: 200, damping: 21 }}
        >
          {"Anh em một đội,"}
        </VerticalCutReveal>
        <VerticalCutReveal
          splitBy="characters"
          staggerDuration={0.018}
          staggerFrom="first"
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 21,
            delay: 0.3,
          }}
        >
          {"bóng đá một tình yêu"}
        </VerticalCutReveal>
      </h1>

      <motion.p
        {...fade(0.75)}
        className="mt-4 text-lg text-white/85 sm:text-xl lg:text-2xl"
      >
        Chúng tôi là Footboys — nhóm anh em mê trái bóng tròn, hễ có kèo là hẹn
        nhau ra sân. Đăng nhập để chốt lịch, vote trận và cùng nhau chiến.
      </motion.p>

      {/* What you get once you're in. */}
      <div className="mt-7 flex flex-wrap justify-center gap-2.5 lg:justify-start">
        {PERKS.map(({ icon: Icon, label }, i) => (
          <motion.span
            key={label}
            {...fade(0.9 + i * 0.1)}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-white/80 backdrop-blur"
          >
            <Icon className="size-4 text-primary" />
            {label}
          </motion.span>
        ))}
      </div>
    </div>
  );
};
