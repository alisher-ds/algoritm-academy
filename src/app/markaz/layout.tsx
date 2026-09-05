import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kurslar — PMT, Digital SAT, IELTS, DTM | Algoritm Academy Qarshi",
  description:
    "Qarshi shahridagi Algoritm Academy o'quv markazi kurslari: Prezident maktabiga tayyorlov (PMT), Digital SAT 1500+, IELTS 7+, Matematika Milliy Sertifikat (A+) va DTM grant. 1-dars bepul.",

};

export default function MarkazLayout({ children }: { children: React.ReactNode }) {
  return children;
}
