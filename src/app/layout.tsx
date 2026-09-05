import type { Metadata } from "next";
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/manrope/wght.css";
import "./globals.css";

// Production'da aniq domen o'rnating: .env.local -> NEXT_PUBLIC_SITE_URL=https://...
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://algoritm.uz");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Algoritm Academy — Xususiy Maktab va Akademik Tayyorlov Ekotizimi",
    template: "%s · Algoritm Academy",
  },
  description:
    "Qarshi shahridagi zamonaviy 0–11 sinf xususiy maktabi hamda Prezident maktabi (PMT), Digital SAT, IELTS va Davlat grantlariga professional tayyorlov ekotizimi.",
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
  creator: "Algoritm Academy",
  publisher: "Algoritm Academy",
  openGraph: {
    title: "Algoritm Academy — Xususiy Maktab va Akademik Tayyorlov Ekotizimi",
    description:
      "Qarshi shahridagi zamonaviy 0–11 xususiy maktab hamda Prezident maktabi, Digital SAT, IELTS va Davlat grantlariga professional tayyorlov ekotizimi.",
    type: "website",
    locale: "uz_UZ",
    url: siteUrl,
    siteName: "Algoritm Academy",
    images: [{ url: "/og-cover.jpg", width: 1200, height: 630, alt: "Algoritm Academy — Qarshi" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Algoritm Academy — Xususiy Maktab va Akademik Tayyorlov",
    description:
      "0–11 sinf xususiy maktabi · PMT, Digital SAT, IELTS, Milliy sertifikat — Qarshi",
    images: ["/og-cover.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Algoritm Academy",
  alternateName: "Algoritm School",
  url: siteUrl,
  telephone: "+998991410505",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Qarshi",
    addressRegion: "Qashqadaryo",
    addressCountry: "UZ",
    streetAddress: "Mustaqillik shoh ko'chasi (Geolog MFY)",
  },
  areaServed: "Qarshi",
  knowsLanguage: ["uz", "ru", "en"],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="bg-white text-slate-900 antialiased min-h-screen selection:bg-brand-500/30 selection:text-brand-950 font-sans">
        {children}
      </body>
    </html>
  );
}
