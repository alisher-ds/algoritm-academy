"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck, Loader2, Info } from "lucide-react";
import { submitLead, LEAD_OPTIONS } from "@/lib/leads";
import { normalizeUzPhone } from "@/lib/phone";
import ScrollReveal from "@/components/ScrollReveal";

const OPTIONS = LEAD_OPTIONS;

export default function LeadBannerSection() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [direction, setDirection] = useState(OPTIONS[0].value);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  // Tasdiq xabarini yashiradigan taymer — komponent unmount bo'lsa bekor qilinadi.
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Iltimos, ismingizni kiriting.");
      return;
    }
    // Server bilan bitta manba: "+998 " prefiksi digits ichida bo'lgani uchun
    // oddiy uzunlik tekshiruvi 3 raqamga adashardi va chala raqam serverga ketardi.
    if (!normalizeUzPhone(phone)) {
      setError("Iltimos, to'liq telefon raqamingizni kiriting (masalan: 90 123 45 67).");
      return;
    }

    setLoading(true);
    setError(null);
    const option = OPTIONS.find((o) => o.value === direction) ?? OPTIONS[0];
    const res = await submitLead({
      name: name.trim(),
      phone: phone.trim(),
      type: option.type,
      targetInterest: option.value,
      source: "Sayt — pastki ariza formasi",
      website: honeypot,
    });

    setLoading(false);
    if (res.ok) {
      setSubmitted(true);
      setError(null);
      setName("");
      setPhone("");
      resetTimer.current = setTimeout(() => setSubmitted(false), 5000);
    } else if (res.storedLocally) {
      // Server ulanmagan bo'lsa ham lokal saqlanadi, foydalanuvchiga halol xabar
      setSubmitted(true);
      setError("Serverga ulanish imkoni bo'lmadi — ariza shu qurilmada saqlandi. Tez orada qayta urinib ko'ring yoki qo'ng'iroq qiling.");
      setName("");
      setPhone("");
      resetTimer.current = setTimeout(() => {
        setSubmitted(false);
        setError(null);
      }, 8000);
    } else {
      setError(res.error || "Xatolik yuz berdi, qayta urinib ko'ring");
    }
  };

  return (
    <section className="bg-slate-50 py-20 sm:py-28 text-slate-900 border-b border-slate-200/80" id="ariza">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="fade-up" duration={750}>
          <div className="rounded-3xl bg-slate-950 text-white p-8 sm:p-14 lg:p-16 relative overflow-hidden shadow-2xl">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left Column: Heading & Value */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-brand-300 text-xs font-bold uppercase tracking-wider border border-white/15">
                <ShieldCheck className="w-4 h-4 text-brand-400" /> Bepul Diagnostika & Suhbat
              </div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Qabul 2026 Uchun <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-400">
                  Arizangizni Qoldiring
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg font-medium">
                Xususiy maktab yoki o'quv markazi kurslariga qiziqishingiz bo'yicha bepul sinov darsi va professional metodist konsultatsiyasini oling.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-slate-300 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>1-dars mutlaqo bepul</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Tez orada mutaxassis aloqasi</span>
                </div>
              </div>
            </div>

            {/* Right Column: Lead Form Card */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-3xl p-7 sm:p-9 text-slate-900 shadow-2xl">
                {submitted ? (
                  <div className="py-12 text-center space-y-4 animate-fade-in">
                    <div className="w-16 h-16 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-9 h-9 text-brand-600" />
                    </div>
                    <h3 className="font-display text-2xl font-extrabold text-slate-950">Arizangiz Qabul Qilindi!</h3>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto font-medium">
                      {error || "Tez orada Algoritm Academy mutaxassisi siz bilan bog'lanadi va bepul dars vaqtini kelishadi."}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    {/* Honeypot — botlar uchun (odamlar ko'rmaydi) */}
                    {/* Botlar to'ldiradigan yashirin maydon. `aria-hidden` fokuslanuvchi
                        elementda a11y qoidasini buzadi va `left-[-9999px]` gorizontal
                        overflow'ga sabab bo'ladi — o'rniga standart "visually hidden". */}
                    <div hidden>
                      <label htmlFor="lead-website">Veb-sayt (to'ldirmang)</label>
                      <input
                        id="lead-website"
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                        Ismingiz yoki Farzandingiz ismi
                      </label>
                      <input
                        type="text"
                        required
                        minLength={2}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Masalan: Sardorbek Alimov"
                        className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:border-brand-600 focus:bg-white transition shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                        Telefon raqamingiz
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "");
                          setPhone(digits ? `+998 ${digits.replace(/^998/, "")}` : "");
                        }}
                        placeholder="+998 (90) 123-45-67"
                        className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono focus:outline-none focus:border-brand-600 focus:bg-white transition shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                        Qaysi yo'nalishga yozilmoqchisiz?
                      </label>
                      <select
                        value={direction}
                        onChange={(e) => setDirection(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:border-brand-600 focus:bg-white transition shadow-sm"
                      >
                        {OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.value}
                          </option>
                        ))}
                      </select>
                    </div>

                    {error && !submitted && (
                      <p className="flex items-start gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-full bg-brand-500 hover:bg-brand-400 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-600/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Yuborilmoqda...
                        </>
                      ) : (
                        <>
                          <span>Arizani Topshirish</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
  );
}
