import type { Metadata } from "next";
import "./globals.css";

// Production'da aniq domen o'rnating: .env.local -> NEXT_PUBLIC_SITE_URL=https://...
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Algoritm Academy — Xususiy Maktab va Akademik Tayyorlov Ekotizimi",
  description: "Qarshi shahridagi zamonaviy 1-11 xususiy maktab hamda Prezident maktabi, Digital SAT, IELTS va Davlat grantlariga professional tayyorlov ekotizimi.",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
  keywords: [
    "Algoritm Academy",
    "Algoritm School",
    "Algoritm Xususiy Maktab",
    "Qarshi xususiy maktab",
    "Prezident maktabiga tayyorlov",
    "SAT Qarshi",
    "IELTS Qarshi",
    "Matematika Milliy Sertifikat",
    "DTM Grant",
  ],
  authors: [{ name: "Algoritm Academy" }],
  openGraph: {
    title: "Algoritm Academy — Xususiy Maktab va Akademik Tayyorlov Ekotizimi",
    description: "Kelajak liderlari uchun fundamental ta'lim, zamonaviy ko'nikmalar, xalqaro grantlar va milliy qadriyatlar maskani.",
    type: "website",
    locale: "uz_UZ",
    images: [{ url: "/logo.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className="scroll-smooth">
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
      </head>
      <body className="bg-white text-slate-900 antialiased min-h-screen selection:bg-emerald-600 selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
