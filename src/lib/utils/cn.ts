import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSS 클래스를 병합하고 충돌을 해결합니다
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
