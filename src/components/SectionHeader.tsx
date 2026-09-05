import type { ComponentType, ReactNode } from "react";
import ScrollReveal from "@/components/ScrollReveal";

interface SectionHeaderProps {
  /** Kichik kapsula yorliq (eyebrow), masalan: "Shaffof qabul 2026" */
  eyebrow?: string;
  /** Eyebrow oldidagi ikonka */
  eyebrowIcon?: ComponentType<{ className?: string }>;
  /** Asosiy sarlavha — Title Case uslubida yoziladi */
  title: ReactNode;
  /** Sarlavha ostidagi tavsif */
  description?: string;
  /** Qorong'u fonli bo'limlar uchun */
  dark?: boolean;
  /** Kengroq sarlavha bloki (max-w-3xl) */
  wide?: boolean;
  /** Markazga tekislash (default: chapga) */
  align?: "left" | "center";
  /** Qo'shimcha klasslar (masalan: "mb-16") */
  className?: string;
  /** Scroll-reveal animatsiyasini yoqish/o'chirish (default: true) */
  animate?: boolean;
}

/**
 * Sayt bo'ylab yagona bo'lim sarlavhasi:
 * eyebrow pill + Manrope sarlavha + tavsif.
 * Apple uslubidagi silliq scroll-reveal bilan ochiladi.
 */
export default function SectionHeader({
  eyebrow,
  eyebrowIcon: Icon,
  title,
  description,
  dark = false,
  wide = false,
  align = "left",
  className = "",
  animate = true,
}: SectionHeaderProps) {
  const centered = align === "center";
  const containerClasses = `${wide ? "max-w-3xl" : "max-w-2xl"} ${
    centered ? "mx-auto text-center" : "text-left"
  } ${className}`;

  const content = (
    <>
      {eyebrow && (
        <span
          className={`mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider ${
            dark
              ? "border border-brand-400/30 bg-brand-400/10 text-brand-400"
              : "border border-brand-200/80 bg-brand-50 text-brand-700"
          }`}
        >
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {eyebrow}
        </span>
      )}
      <h2
        className={`font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.6rem] lg:leading-[1.12] ${
          dark ? "text-white" : "text-slate-950"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 max-w-xl text-base leading-relaxed ${
            dark ? "text-slate-400" : "text-slate-600"
          } ${centered ? "mx-auto" : ""}`}
        >
          {description}
        </p>
      )}
    </>
  );

  if (!animate) {
    return <div className={containerClasses}>{content}</div>;
  }

  return (
    <ScrollReveal variant="fade-up" duration={700} className={containerClasses}>
      {content}
    </ScrollReveal>
  );
}
