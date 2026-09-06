import type { Metadata } from "next";
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/manrope/wght.css";
import "./globals.css";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";

// Production'da aniq domen o'rnating: .env.local -> NEXT_PUBLIC_SITE_URL=https://...
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://algoritm.uz");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
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

/**
 * Schema.org ma'lumotlari ECOSYSTEM_DATA dan hosil qilinadi — ilgari telefon va
 * manzil qo'lda takrorlangan edi va kontent yangilanganda schema eskirib qolardi.
 */
const { school, academy, contact } = ECOSYSTEM_DATA;

const campusSchema = (
  id: string,
  name: string,
  campus: { address: string; coordinates: { lat: number; lng: number }; phone: string; workingHours: string }
) => ({
  "@type": "Place",
  "@id": `${siteUrl}#${id}`,
  name,
  address: {
    "@type": "PostalAddress",
    streetAddress: campus.address,
    addressLocality: "Qarshi",
    addressRegion: "Qashqadaryo",
    addressCountry: "UZ",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: campus.coordinates.lat,
    longitude: campus.coordinates.lng,
  },
  telephone: campus.phone.replace(/\D/g, "").replace(/^/, "+"),
  openingHours: `Mo-Sa ${campus.workingHours.replace(/\s/g, "")}`,
});

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "@id": `${siteUrl}#organization`,
  name: ECOSYSTEM_DATA.name,
  alternateName: school.name,
  url: siteUrl,
  logo: `${siteUrl}/icon.png`,
  image: `${siteUrl}/og-cover.jpg`,
  email: contact.email,
  telephone: `+${contact.phoneMain.replace(/\D/g, "")}`,
  address: {
    "@type": "PostalAddress",
    streetAddress: school.address,
    addressLocality: "Qarshi",
    addressRegion: "Qashqadaryo",
    addressCountry: "UZ",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: school.coordinates.lat,
    longitude: school.coordinates.lng,
  },
  areaServed: "Qarshi",
  knowsLanguage: ["uz", "ru", "en"],
  sameAs: [contact.telegram, contact.instagram, school.telegram],
  location: [
    campusSchema("maktab", school.name, school),
    campusSchema("markaz", academy.name, academy),
  ],
};

/** FAQ javoblari qidiruv natijalarida kengaytirilgan blok sifatida chiqishi uchun. */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ECOSYSTEM_DATA.faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body className="bg-white text-slate-900 antialiased min-h-screen selection:bg-brand-500/30 selection:text-brand-950 font-sans">
        {children}
      </body>
    </html>
  );
}
