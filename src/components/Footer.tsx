"use client";

import React from "react";
import Link from "next/link";
import { 
  Phone, 
  MapPin, 
  Send, 
  Globe,
  School,
  GraduationCap
} from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
          
          {/* Col 1: Brand & Logo */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl p-1 bg-white/10 border border-white/20 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Algoritm Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black uppercase tracking-tight text-white leading-none">
                  ALGORITM
                </span>
                <span className="text-[10px] text-emerald-400 font-extrabold tracking-wider uppercase mt-1">
                  Academy
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-medium">
              1-11 sinf xususiy maktabi hamda Prezident maktablari, Digital SAT va Davlat grantlariga professional tayyorlovni birlashtirgan flagman ta'lim ekotizimi.
            </p>

            <div className="text-xs text-slate-400 space-y-1">
              <div>Davlat Litsenziyasi: <strong className="text-slate-200">{ECOSYSTEM_DATA.licenseNumber}</strong></div>
              <div>Ta'lim tili: <strong className="text-slate-200">O'zbek / Rus</strong></div>
            </div>
          </div>

          {/* Col 2: School Links */}
          <div className="lg:col-span-3 space-y-3 text-left">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <School className="w-4 h-4 text-emerald-400" /> Algoritm School (1-11 Sinf)
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><Link href="/#haqida" className="hover:text-emerald-400 transition">Maktab Missiyasi</Link></li>
              <li><Link href="/#maktab" className="hover:text-emerald-400 transition">0-11 Sinf Dasturlari</Link></li>
              <li><Link href="/#sharoitlar" className="hover:text-emerald-400 transition">3 Mahal Ovqat &amp; Transport</Link></li>
              <li><Link href="/#kun-tartibi" className="hover:text-emerald-400 transition">Kun Tartibi (08:00–17:00)</Link></li>
              <li><Link href="/#natijalar" className="hover:text-emerald-400 transition">Akademik Natijalar</Link></li>
              <li><Link href="/#qabul" className="hover:text-emerald-400 transition">Qabul 2026</Link></li>
            </ul>
          </div>

          {/* Col 3: Academy Links */}
          <div className="lg:col-span-2 space-y-3 text-left">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-400" /> Algoritm Kurslari
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><Link href="/#kurslar" className="hover:text-emerald-400 transition">Prezident Maktabi (PMT)</Link></li>
              <li><Link href="/#kurslar" className="hover:text-emerald-400 transition">Digital SAT 1500+</Link></li>
              <li><Link href="/#kurslar" className="hover:text-emerald-400 transition">IELTS 7.5+ &amp; CEFR</Link></li>
              <li><Link href="/#kurslar" className="hover:text-emerald-400 transition">Matematika Milliy A+</Link></li>
              <li><Link href="/#kurslar" className="hover:text-emerald-400 transition">DTM Davlat Granti</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact & Address */}
          <div className="lg:col-span-3 space-y-3 text-left">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Aloqa &amp; Manzil
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400 font-medium">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{ECOSYSTEM_DATA.contact.address} ({ECOSYSTEM_DATA.contact.landmark})</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${ECOSYSTEM_DATA.contact.phoneMain.replace(/\D/g, "")}`} className="hover:text-white font-mono">
                  {ECOSYSTEM_DATA.contact.phoneMain}
                </a>
                <span className="text-slate-600">— O'quv markazi</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${ECOSYSTEM_DATA.contact.phoneSecondary.replace(/\D/g, "")}`} className="hover:text-white font-mono">
                  {ECOSYSTEM_DATA.contact.phoneSecondary}
                </a>
                <span className="text-slate-600">— O'quv markazi 2-raqam</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${ECOSYSTEM_DATA.school.phone.replace(/\D/g, "")}`} className="hover:text-white font-mono">
                  {ECOSYSTEM_DATA.school.phone}
                </a>
                <span className="text-slate-600">— Maktab qabuli</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <a
                href={ECOSYSTEM_DATA.contact.telegram}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-emerald-600 flex items-center justify-center text-white transition"
                aria-label="Telegram"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href={ECOSYSTEM_DATA.contact.instagram}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-emerald-600 flex items-center justify-center text-white transition"
                aria-label="Instagram"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © 2026 Algoritm Academy. Barcha huquqlar himoyalangan.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/#maktab" className="hover:text-white transition">Xususiy Maktab</Link>
            <Link href="/#kurslar" className="hover:text-white transition">O'quv Markazi</Link>
            <Link href="/aloqa" className="hover:text-white transition">Aloqa</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
