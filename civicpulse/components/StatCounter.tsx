"use client";
import { useEffect, useState } from "react";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface StatCounterProps {
  value: number;
  suffix: string;
  label: string;
  duration?: number;
}

export default function StatCounter({
  value,
  suffix,
  label,
  duration = 1800,
}: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [displayedValue, setDisplayedValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let animationFrame: number;
    const start = performance.now();

    const tick = (timestamp: number) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayedValue(Math.round(value * easeOut));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick);
      } else {
        setDisplayedValue(value);
      }
    };

    animationFrame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrame);
  }, [inView, value, duration]);

  return (
    <div ref={ref} className="flex flex-col items-start">
      <div className="font-display text-4xl font-light tracking-tight text-[#1A1208]">
        {displayedValue}
        {suffix}
      </div>
      <div className="font-mono text-xs uppercase tracking-[0.15em] text-[#7A6A58] mt-1">
        {label}
      </div>
    </div>
  );
}
