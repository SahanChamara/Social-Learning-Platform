import { clsx, type ClassValue } from "clsx";

/**
 * Merges multiple class names into a single string.
 * Useful for combining Tailwind classes with conditional classes.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
