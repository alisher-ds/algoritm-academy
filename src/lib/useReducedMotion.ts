"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return typeof window !== "undefined" && window.matchMedia(QUERY).matches;
}

/** Serverda har doim `false` — shu tufayli hydration nomuvofiqligi bo'lmaydi. */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Foydalanuvchining "harakatni kamaytirish" sozlamasi.
 *
 * `useState` initializer'ida `matchMedia` o'qish serverda `false`, klientda
 * `true` berib hydration xatosiga olib kelardi; effekt ichida sinxron
 * `setState` esa kaskadli render qoidasini buzardi. `useSyncExternalStore`
 * ikkala muammoni ham hal qiladi va sozlama o'zgarsa avtomatik yangilanadi.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
