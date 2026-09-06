import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Barcha kurslar va dars jadvallari",
  description:
    "Algoritm Academy o'quv markazining 12 ta kursi: Prezident maktabiga tayyorlov (PMT), Digital SAT 1500+, IELTS 7+, Matematika Milliy sertifikat (A+), Biologiya, Kimyo, Fizika, Huquq va Tarix. Aniq dars kunlari, vaqtlari va murabbiylar. 1-dars bepul.",
  alternates: { canonical: "/kurslar" },
};

export default function KurslarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
