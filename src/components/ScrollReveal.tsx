"use client";

import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

export type RevealVariant =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "fade-in"
  | "scale-up";

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number; // ms
  duration?: number; // ms
  threshold?: number;
  distance?: number; // px
  className?: string;
  once?: boolean;
}

export default function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 750,
  threshold = 0.15,
  distance = 32,
  className = "",
  once = false,
  style,
  ...rest
}: ScrollRevealProps) {
  const reducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = elementRef.current;
    // Harakat kamaytirilgan bo'lsa kuzatuvchi umuman kerak emas —
    // ko'rinish holati render vaqtida quyida hal qilinadi.
    if (!node || reducedMotion) return;

    if (typeof IntersectionObserver === "undefined") {
      const timer = setTimeout(() => setIsVisible(true), 0);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(node);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold, once, reducedMotion]);

  // Harakat kamaytirilgan bo'lsa kontent har doim ko'rinadi va siljimaydi.
  const shown = isVisible || reducedMotion;

  const getTransform = () => {
    if (shown) return "translate3d(0, 0, 0) scale(1)";

    switch (variant) {
      case "fade-up":
        return "translate3d(0, " + distance + "px, 0)";
      case "fade-down":
        return "translate3d(0, -" + distance + "px, 0)";
      case "fade-left":
        return "translate3d(" + distance + "px, 0, 0)";
      case "fade-right":
        return "translate3d(-" + distance + "px, 0, 0)";
      case "scale-up":
        return "translate3d(0, " + Math.round(distance / 2) + "px, 0) scale(0.95)";
      case "fade-in":
      default:
        return "translate3d(0, 0, 0)";
    }
  };

  const dynamicStyle: React.CSSProperties = {
    opacity: shown ? 1 : 0,
    transform: getTransform(),
    transitionProperty: "opacity, transform",
    transitionDuration: reducedMotion ? "0ms" : shown ? duration + "ms" : "250ms",
    transitionDelay: shown && !reducedMotion ? delay + "ms" : "0ms",
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    willChange: shown ? "auto" : "opacity, transform",
    ...style,
  };

  return (
    <div
      ref={elementRef}
      className={className}
      style={dynamicStyle}
      {...rest}
    >
      {children}
    </div>
  );
}
