import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galereya — Foto Lavhalar | Algoritm Academy Qarshi",
  description:
    "Algoritm xususiy maktabi va akademiyasining dars jarayonlari, zamonaviy sinfxonalar va tadbir lavhalari fotogalereyasi.",

};

export default function GalereyaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
