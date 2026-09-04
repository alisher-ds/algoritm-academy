"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Phone, 
  Menu, 
  X, 
  GraduationCap, 
  School, 
  } from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";

interface NavbarProps {
  onOpenLeadModal?: (targetName?: string) => void;
}

export default function Navbar({ onOpenLeadModal }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-4 sm:top-6 inset-x-0 z-50 px-4 sm:px-8">
      <div
        className={`max-w-7xl mx-auto rounded-full transition-all duration-300 px-5 sm:px-7 py-3 flex items-center justify-between border ${
          isScrolled
            ? "bg-[#0c121e]/90 backdrop-blur-xl border-white/15 shadow-2xl text-white"
            : "bg-[#0c121e]/75 backdrop-blur-md border-white/10 shadow-xl text-white"
        }`}
      >
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full p-0.5 bg-white/10 border border-white/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <img
              src="/logo.png"
              alt="Algoritm Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm sm:text-base font-black uppercase tracking-tight text-white leading-none">
              ALGORITM
            </span>
            <span className="text-[9px] text-[#00E676] font-bold uppercase tracking-wider mt-0.5">
              Academy
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs sm:text-[13px] font-medium text-slate-200">
          <Link href="/#maktab" className="hover:text-[#00E676] transition-colors flex items-center gap-1.5">
            <School className="w-3.5 h-3.5 text-[#00E676]" />
            <span>Maktab (1-11)</span>
          </Link>
          <Link href="/#kurslar" className="hover:text-[#00E676] transition-colors flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-[#00E676]" />
            <span>Kurslar (PMT, SAT)</span>
          </Link>
          <Link href="/#natijalar" className="hover:text-[#00E676] transition-colors">
            Natijalar
          </Link>
          <Link href="/#sharoitlar" className="hover:text-[#00E676] transition-colors">
            Sharoitlar
          </Link>
          <Link href="/#ustozlar" className="hover:text-[#00E676] transition-colors">
            Ustozlar
          </Link>
          <Link href="/#qabul" className="hover:text-[#00E676] transition-colors">
            Qabul 2026
          </Link>
        </nav>

        {/* Right Section: Phone & CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href={`tel:${ECOSYSTEM_DATA.contact.phoneMain.replace(/\D/g, "")}`}
            className="text-xs font-semibold text-slate-200 hover:text-white font-mono flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 transition"
          >
            <Phone className="w-3.5 h-3.5 text-[#00E676]" />
            <span>{ECOSYSTEM_DATA.contact.phoneMain}</span>
          </a>

          {/* Consultation / Application Button */}
          <button
            onClick={() => { if (onOpenLeadModal) onOpenLeadModal("Header ariza"); }}
            className="px-4 py-2 rounded-full bg-[#00C853] hover:bg-[#00E676] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20"
          >
            Ariza qoldirish
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={() => { if (onOpenLeadModal) onOpenLeadModal("Mobil header ariza"); }}
            className="px-3 py-1.5 rounded-full bg-[#00C853] text-white text-[11px] font-bold uppercase"
          >
            Ariza
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="Menyu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-2 max-w-7xl mx-auto rounded-3xl bg-[#0c121e]/95 backdrop-blur-2xl border border-white/15 p-5 shadow-2xl text-white animate-in slide-in-from-top-3 duration-200">
          <nav className="flex flex-col space-y-3 text-sm font-medium">
            <Link
              href="/#maktab"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-slate-200 hover:text-[#00E676] flex items-center gap-2"
            >
              <School className="w-4 h-4 text-[#00E676]" />
              <span>1-11 Sinf Xususiy Maktabi</span>
            </Link>
            <Link
              href="/#kurslar"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-slate-200 hover:text-[#00E676] flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-[#00E676]" />
              <span>O'quv Markazi Kurslari (PMT, SAT, IELTS)</span>
            </Link>
            <Link
              href="/#natijalar"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-slate-200 hover:text-[#00E676]"
            >
              Akademik Natijalar
            </Link>
            <Link
              href="/#sharoitlar"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-slate-200 hover:text-[#00E676]"
            >
              Sharoitlar (3 Mahal taom, Transport, Yotoqxona)
            </Link>
            <Link
              href="/#ustozlar"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-slate-200 hover:text-[#00E676]"
            >
              Ustozlar Kengashi
            </Link>
            <Link
              href="/#qabul"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-slate-200 hover:text-[#00E676]"
            >
              Qabul 2026
            </Link>
          </nav>

          <div className="pt-4 mt-3 border-t border-white/10 space-y-2">
            <a
              href={`tel:${ECOSYSTEM_DATA.contact.phoneMain.replace(/\D/g, "")}`}
              className="w-full py-2.5 rounded-xl bg-white/10 text-white font-mono text-xs flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#00E676]" />
              <span>{ECOSYSTEM_DATA.contact.phoneMain}</span>
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenLeadModal) onOpenLeadModal("Mobil qabul arizasi");
              }}
              className="w-full py-3 rounded-full bg-[#00C853] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Qabulga ariza qoldirish</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
