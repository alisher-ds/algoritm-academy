import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatUzPhone } from "./phone";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPhoneNumber = formatUzPhone;
