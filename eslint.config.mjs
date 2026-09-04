import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // O'zbek matnidagi apostroflar (masalan: o'quvchi, ta'lim) JSX'da juda ko'p
      // qo'llanadi. Har birini &apos; ga aylantirish kodni o'qib bo'lmas qiladi va
      // xatolik xavfini oshiradi — qoida ataylab o'chirilgan.
      "react/no-unescaped-entities": "off",
      // Marketing landing sahifasidagi rasmlarning barchasi /public ichidagi statik
      // fayllar. next/image optimizatsiyasiga keyingi bosqichda o'tkazish rejalangan.
      "@next/next/no-img-element": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
