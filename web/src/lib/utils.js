import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Une classnames y resuelve conflictos de Tailwind */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}