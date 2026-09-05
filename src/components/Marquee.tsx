"use client";

import React, { ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  direction?: "left" | "right";
  speed?: number; // soniya (aylanish davri)
  pauseOnHover?: boolean;
  className?: string;
}

export default function Marquee({
  children,
  direction = "left",
  speed = 35,
  pauseOnHover = true,
  className = "",
}: MarqueeProps) {
  const animName = direction === "left" ? "marquee-to-left" : "marquee-to-right";

  return (
    <div
      className={`group relative flex overflow-hidden select-none ${className}`}
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 92%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 92%, transparent 100%)",
      }}
    >
      <style jsx>{`
        @keyframes marquee-to-left {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        @keyframes marquee-to-right {
          0% {
            transform: translate3d(-50%, 0, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: ${animName} ${speed}s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none !important;
          }
        }
      `}</style>

      <div
        className={`marquee-track shrink-0 ${
          pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""
        }`}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
