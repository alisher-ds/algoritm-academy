"use client";

import React, { useRef, useState, useCallback } from "react";

interface CardSpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  radius?: number;
  dark?: boolean;
}

export default function CardSpotlight({
  children,
  className = "",
  radius = 320,
  dark = false,
  ...rest
}: CardSpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: -500, y: -500 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setOpacity(1);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOpacity(0);
  }, []);

  // Raycast/Apple uslubidagi nozik gradient ranglari
  const borderHighlight = dark
    ? "rgba(0, 230, 118, 0.45)"
    : "rgba(0, 200, 83, 0.35)";

  const surfaceHighlight = dark
    ? "rgba(0, 200, 83, 0.08)"
    : "rgba(0, 200, 83, 0.05)";

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative p-[1.5px] rounded-3xl overflow-hidden transition-all duration-300 group ${
        dark
          ? "bg-white/10 hover:shadow-[0_12px_40px_rgba(0,200,83,0.18)]"
          : "bg-slate-200/90 hover:shadow-xl hover:shadow-brand-950/5"
      } ${className}`}
      {...rest}
    >
      {/* 1. Kursor bo'ylab harakatlanuvchi nurli hoshiya (Border Spotlight) */}
      <div
        className="pointer-events-none absolute -inset-[1px] transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(${radius}px circle at ${position.x}px ${position.y}px, ${borderHighlight}, transparent 70%)`,
        }}
      />

      {/* 2. Asosiy ichki kartochka yuzasi */}
      <div
        className={`relative w-full h-full rounded-[calc(1.5rem-1.5px)] overflow-hidden flex flex-col justify-between ${
          dark ? "bg-[#0b1329]" : "bg-white"
        }`}
      >
        {/* 3. Ichki mayin kursor nuri (Surface Glow) */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity,
            background: `radial-gradient(${radius * 1.2}px circle at ${position.x}px ${position.y}px, ${surfaceHighlight}, transparent 65%)`,
          }}
        />

        {/* Kartochka kontenti */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between">
          {children}
        </div>
      </div>
    </div>
  );
}
