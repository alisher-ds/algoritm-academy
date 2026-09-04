import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aloqa — Manzil va Telefonlar | Algoritm Academy Qarshi",
  description:
    "Algoritm School (xususiy maktab) va Algoritm Academy (o'quv markazi) manzillari, telefon raqamlari va Telegram manzillari. Qarshi shahri, Mustaqillik shoh ko'chasi.",

};

export default function AloqaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
