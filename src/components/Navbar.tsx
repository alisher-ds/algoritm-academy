"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Menu, X, GraduationCap, School } from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";

interface NavbarProps {
  onOpenLeadModal?: (targetName?: string) => void;
}

const NAV_LINKS = [
  { href: "/#dasturlar", label: "Maktab 0–11", icon: School },
  { href: "/kurslar", label: "Kurslar", icon: GraduationCap },
  { href: "/#natijalar", label: "Natijalar" },
  { href: "/#sharoitlar", label: "Sharoitlar" },
  { href: "/#ustozlar", label: "Ustozlar" },
  { href: "/#qabul", label: "Qabul" },
] as const;

export default function Navbar({ onOpenLeadModal }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const pathname = usePathname();

  // Bosh sahifada bo'limlar kesishganda faol havolani belgilash
  useEffect(() => {
    if (pathname !== "/") return undefined;
    const ids = NAV_LINKS.map((l) => l.href.replace("/#", ""));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mobile menyu ochiqda body scroll'ni bloklash
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const openLead = useCallback(
    (target: string) => {
      setMobileMenuOpen(false);
      onOpenLeadModal?.(target);
    },
    [onOpenLeadModal]
  );

  const isHome = pathname === "/";
  // Bosh sahifa — maktab qabuli; boshqa sahifalar — o'quv markazi raqami
  const primaryPhone = isHome
    ? ECOSYSTEM_DATA.school.phone
    : ECOSYSTEM_DATA.contact.phoneMain;
  const phoneLabel = isHome ? "Maktab qabuli" : "O'quv markazi";

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 sm:px-6">
      <div
        className={`mx-auto mt-3 max-w-7xl border px-4 sm:px-6 transition-all duration-300 ${
          mobileMenuOpen
            ? "rounded-2xl border-white/15 bg-night-deep/95 backdrop-blur-2xl shadow-2xl"
            : isScrolled
            ? "rounded-full border-white/15 bg-night-deep/90 shadow-2xl backdrop-blur-2xl"
            : "rounded-full border-white/15 bg-black/35 backdrop-blur-xl shadow-lg"
        }`}
      >
        <div className="flex h-14 items-center justify-between gap-3">
          {/* Brand */}
          <Link href="/" className="group flex items-center gap-2.5" aria-label="Algoritm Academy — bosh sahifa">
            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15 transition-transform duration-200 group-hover:scale-105">
              <img src="/logo.png" alt="" className="h-full w-full object-contain" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-sm font-extrabold tracking-tight text-white">
                Algoritm
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-brand-400">
                Academy
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Asosiy navigatsiya">
            {NAV_LINKS.map((link) => {
              const isActive =
                (isHome && link.href.startsWith("/#") && activeSection === link.href.replace("/#", "")) ||
                pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                    isActive ? "text-brand-400 font-semibold" : "text-slate-300 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
                  )}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2.5">
            <a
              href={`tel:${primaryPhone.replace(/\D/g, "")}`}
              className="hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:text-white xl:flex"
            >
              <Phone className="h-3.5 w-3.5 text-brand-400" />
              <span className="font-mono tracking-tight">{primaryPhone}</span>
            </a>

            <button
              onClick={() => openLead("Navbar ariza")}
              className="hidden rounded-full bg-brand-500 hover:bg-brand-400 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-glow transition-all active:scale-[0.98] sm:block"
            >
              Ariza topshirish
            </button>

            {/* Mobile: CTA + burger */}
            <button
              onClick={() => openLead("Mobil header ariza")}
              className="rounded-full bg-brand-500 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-brand-400 sm:hidden"
            >
              Ariza
            </button>
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? "Menyuni yopish" : "Menyuni ochish"}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 lg:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile panel */}
        {mobileMenuOpen && (
          <nav
            id="mobile-menu"
            aria-label="Mobil navigatsiya"
            className="animate-fade-in border-t border-white/10 py-3 lg:hidden"
          >
            <div className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
              <a
                href={`tel:${primaryPhone.replace(/\D/g, "")}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white"
              >
                <Phone className="h-4 w-4 text-brand-400" />
                <span className="font-mono">{primaryPhone}</span>
                <span className="text-xs text-slate-400">{phoneLabel}</span>
              </a>
              <button
                onClick={() => openLead("Mobil qabul arizasi")}
                className="w-full rounded-xl bg-brand-500 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-brand-400"
              >
                Qabulga ariza qoldirish — 1-dars bepul
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
