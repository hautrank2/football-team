"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect } from "react";

// A number that counts up to `value` when it first renders (and re-runs whenever
// the value changes). Honours prefers-reduced-motion by jumping straight to the
// final number. Use `tabular-nums` on the className so the width doesn't jitter.
export const CountUp = ({
  value,
  duration = 0.9,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) => {
  const reduce = useReducedMotion();
  const raw = useMotionValue(0);
  const text = useTransform(raw, (v) => Math.round(v).toString());

  useEffect(() => {
    if (reduce) {
      raw.set(value);
      return;
    }
    const controls = animate(raw, value, { duration, ease: "easeOut" });
    return () => controls.stop();
  }, [value, duration, reduce, raw]);

  return <motion.span className={className}>{text}</motion.span>;
};
