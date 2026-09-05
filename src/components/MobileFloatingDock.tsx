"use client";

import React from "react";
import { Phone, MapPin, Sparkles } from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";

interface MobileFloatingDockProps {
  onOpenLeadModal: (targetName?: string) => void;
}

export default function MobileFloatingDock({
  onOpenLeadModal,
}: MobileFloatingDockProps) {
  const rawPhone = ECOSYSTEM_DATA.school.phone || ECOSYSTEM_DATA.contact.phoneMain;
  const phoneClean = rawPhone.replace(/\D/g, "");
  const telegramUrl = ECOSYSTEM_DATA.school.telegram || ECOSYSTEM_DATA.contact.telegram;

  return (
    <aside
      aria-label="Mobil tezkor harakatlar paneli"
      className="fixed bottom-3 inset-x-3 z-40 md:hidden max-w-md mx-auto transition-transform duration-300"
      style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))" }}
    >
      <div 
        className="backdrop-blur-2xl border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.7)] rounded-2xl p-1.5 flex items-center justify-between gap-1 ring-1 ring-white/10"
        style={{ backgroundColor: "rgba(7, 11, 20, 0.95)" }}
      >
        {/* 1. Qo'ng'iroq */}
        <a
          href={`tel:+${phoneClean}`}
          className="flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl text-slate-200 hover:text-emerald-400 active:text-emerald-400 active:scale-95 transition-all group"
          aria-label="Maktab ma'muriyatiga to'g'ridan-to'g'ri qo'ng'iroq qilish"
        >
          <div className="relative">
            <Phone className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
          </div>
          <span className="text-[10px] font-semibold tracking-tight mt-0.5 text-slate-200 group-hover:text-emerald-300">
            Qo'ng'iroq
          </span>
        </a>

        {/* 2. Telegram */}
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl text-slate-200 hover:text-sky-400 active:text-sky-400 active:scale-95 transition-all group relative"
          aria-label="Telegram orqali tezkor konsultatsiya olish"
        >
          <div className="relative">
            <svg
              className="w-4 h-4 fill-sky-400 group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.892-1.393 6.643-2.022 9.539-.266 1.226-.77 1.583-1.258 1.623-.974.089-1.713-.644-2.658-1.263-1.48-.969-2.316-1.572-3.754-2.52-1.662-1.096-.585-1.698.363-2.684.248-.258 4.555-4.175 4.638-4.53.01-.045.019-.214-.08-.302-.1-.088-.247-.058-.353-.034-.15.034-2.535 1.61-7.155 4.731-.677.464-1.29.691-1.839.679-.606-.013-1.772-.343-2.639-.625-1.063-.346-1.908-.528-1.834-1.116.039-.306.46-.62 1.264-.942 4.95-2.155 8.253-3.576 9.91-4.264 4.717-1.956 5.698-2.296 6.338-2.308.141-.002.455.033.659.198.172.139.22.327.243.459.023.132.052.428.029.66z" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-sky-400 ring-2 ring-slate-950 animate-pulse" />
          </div>
          <span className="text-[10px] font-semibold tracking-tight mt-0.5 text-slate-200 group-hover:text-sky-300">
            Telegram
          </span>
        </a>

        {/* 3. Manzil */}
        <a
          href="#xarita"
          className="flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl text-slate-200 hover:text-amber-400 active:text-amber-400 active:scale-95 transition-all group"
          aria-label="Maktab lokatsiyasi va interaktiv xaritaga o'tish"
        >
          <MapPin className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-semibold tracking-tight mt-0.5 text-slate-200 group-hover:text-amber-300">
            Manzil
          </span>
        </a>

        {/* Nozik Vertikal Ajratuvchi Chiziq */}
        <div className="w-px h-6 bg-white/20 mx-0.5 shrink-0" />

        {/* 4. Asosiy Konversiya Tugmasi: Ariza topshirish */}
        <button
          type="button"
          onClick={() => onOpenLeadModal("Mobil Tezkor Panel — Qabul 2026")}
          className="flex-1 h-11 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-1.5 px-3 transition-all cursor-pointer select-none"
          aria-label="Qabul 2026 uchun ariza qoldirish"
        >
          <Sparkles className="w-4 h-4 text-emerald-200 shrink-0 animate-pulse" />
          <span className="tracking-tight whitespace-nowrap">Ariza topshirish</span>
        </button>
      </div>
    </aside>
  );
}
