import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aloqa — manzil va telefonlar",
  description:
    "Algoritm School (xususiy maktab) va Algoritm Academy (o'quv markazi) manzillari, telefon raqamlari va Telegram manzillari. Qarshi shahri, Mustaqillik shoh ko'chasi.",
  alternates: { canonical: "/aloqa" },
};

export default function AloqaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
