"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html lang="uz">
      <body className="bg-[#0b1120] text-white flex flex-col items-center justify-center min-h-screen px-4 text-center font-sans">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-6 text-rose-400">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Tizimda jiddiy xatolik yuz berdi
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
          Iltimos, sahifani yangilang. Agar muammo davom etsa, markaz ma'muriyati bilan bog'laning.
        </p>

        <button
          onClick={() => reset()}
          className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Qayta urinish
        </button>
      </body>
    </html>
  );
}
