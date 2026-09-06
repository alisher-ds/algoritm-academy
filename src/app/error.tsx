"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Router Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center bg-night text-white">
      <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-6 text-rose-400">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white mb-2">
        Kutilmagan xatolik yuz berdi
      </h1>

      <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
        Sahifani yuklashda vaqtinchalik muammo yuz berdi. Iltimos, sahifani qayta yuklab ko'ring yoki bosh sahifaga qayting.
      </p>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        <button
          onClick={() => reset()}
          className="px-6 py-3 rounded-full bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-lg shadow-brand-500/20 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Qayta urinish
        </button>

        <Link
          href="/"
          className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 border border-white/15"
        >
          <Home className="w-4 h-4" /> Bosh sahifaga
        </Link>
      </div>
    </div>
  );
}
