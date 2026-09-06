import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galereya — foto lavhalar",
  description:
    "Algoritm xususiy maktabi va akademiyasining dars jarayonlari, zamonaviy sinfxonalar va tadbir lavhalari fotogalereyasi.",
  alternates: { canonical: "/galereya" },
};

export default function GalereyaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
