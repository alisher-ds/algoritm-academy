import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Algoritm Academy — Xususiy Maktab va Akademik Tayyorlov Ekotizimi",
  description: "Qarshi shahridagi zamonaviy 1-11 xususiy maktab hamda Prezident maktabi, Digital SAT, IELTS va Davlat grantlariga professional tayyorlov ekotizimi.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/logo.png" }],
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
