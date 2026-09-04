import React from "react";
import { Users, Award, Sparkles, GraduationCap, Globe, ShieldCheck } from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";

const iconMap: Record<string, React.ReactNode> = {
  Users: <Users className="w-5 h-5 text-brand-500" />,
  Award: <Award className="w-5 h-5 text-brand-500" />,
  Sparkles: <Sparkles className="w-5 h-5 text-brand-500" />,
  GraduationCap: <GraduationCap className="w-5 h-5 text-brand-500" />,
  Globe: <Globe className="w-5 h-5 text-brand-500" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5 text-brand-500" />,
};

export default function StatsCounter() {
  return (
    <section className="bg-night-deep border-y border-emerald-500/15 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {ECOSYSTEM_DATA.stats.map((stat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all duration-300 text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 text-brand-500 group-hover:scale-110 transition-transform">
                {iconMap[stat.icon] || <Sparkles className="w-5 h-5 text-brand-500" />}
              </div>
              <div className="text-2xl font-black text-white tracking-tight group-hover:text-brand-500 transition-colors">
                {stat.value}
              </div>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
