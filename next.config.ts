import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/** Xavfsizlik sarlavhalari (barcha route'lar uchun). */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Admin panel hech qachon keshlanmasin va indekslanmasin.
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      // Statik media.
      //
      // `immutable` ISHLATILMAYDI: fayl nomlarida hash yo'q (`slide_1.jpg`),
      // shuning uchun `immutable` bilan rasmni almashtirsangiz qaytgan
      // foydalanuvchi bir yil davomida eskisini ko'rardi va uni tuzatib
      // bo'lmasdi. `stale-while-revalidate` esa tez ishlaydi-yu, fon rejimida
      // yangilanadi. Fayl nomiga versiya qo'shsangiz (`slide_1.v2.jpg`)
      // `immutable` ga qaytish xavfsiz bo'ladi.
      {
        source: "/videos/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
};

export default nextConfig;
