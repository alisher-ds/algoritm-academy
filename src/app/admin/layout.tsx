import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CRM — Arizalar Boshqaruvi | Algoritm Academy",
  description:
    "Algoritm Academy sayt arizalarini boshqarish portali (faqat vakolatli foydalanuvchilar uchun).",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
