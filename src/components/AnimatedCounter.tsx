"use client";

import React, { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  target: number;
  start?: number;
  duration?: number; // ms
  prefix?: string;
  suffix?: string;
  className?: string;
  once?: boolean;
}

export default function AnimatedCounter({
  target,
  start = 0,
  duration = 1800,
  prefix = "",
  suffix = "",
  className = "",
  once = false,
}: AnimatedCounterProps) {
  const [count, setCount] = useState<number>(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return target;
    }
    return start;
  });

  const nodeRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const node = nodeRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      const timer = setTimeout(() => setCount(target), 0);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          if (!isAnimatingRef.current) {
            isAnimatingRef.current = true;
            if (once) {
              observer.unobserve(node);
            }

            if (rafRef.current !== null) {
              cancelAnimationFrame(rafRef.current);
            }

            let startTime: number | null = null;

            const step = (timestamp: number) => {
              if (!startTime) startTime = timestamp;
              const elapsed = timestamp - startTime;
              const progress = Math.min(elapsed / duration, 1);

              // easeOutExpo silliq to'xtash formulasi
              const easeProgress =
                progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
              const current = Math.round(start + (target - start) * easeProgress);

              setCount(current);

              if (progress < 1) {
                rafRef.current = requestAnimationFrame(step);
              } else {
                rafRef.current = null;
              }
            };

            rafRef.current = requestAnimationFrame(step);
          }
        } else if (!once) {
          isAnimatingRef.current = false;
          if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
          setCount(start);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, start, duration, once]);

  return (
    <span ref={nodeRef} className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}
