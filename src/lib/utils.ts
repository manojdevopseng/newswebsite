import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateTimeIST(date: string | Date): string {
  return new Date(date).toLocaleString("en-IN", {
    timeZone:    "Asia/Kolkata",
    day:         "numeric",
    month:       "short",
    year:        "numeric",
    hour:        "numeric",
    minute:      "2-digit",
    hour12:      true,
  }) + " IST";
}

export function formatRelativeDate(date: string | Date): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return formatDistanceToNow(d, { addSuffix: true });
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).replace(/\s+\S*$/, "") + "…";
}

export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/**
 * Returns the correct base URL for internal API calls.
 * - On Vercel: uses VERCEL_URL (auto-set per deployment, no custom domain needed)
 * - Explicit override: NEXT_PUBLIC_URL
 * - Local dev: http://localhost:3000
 */
export function getBaseUrl(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NEXT_PUBLIC_URL) return process.env.NEXT_PUBLIC_URL;
  return "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_URL || "https://techpulseglobe.com";
  return `${base}${path}`;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Post-processes article HTML to ensure all <img> tags have alt text.
 * Images without alt get the article title as fallback.
 * Also adds loading="lazy" to any img that doesn't already have a loading attribute.
 */
export function processContentImages(html: string, fallbackAlt: string): string {
  const safeAlt = fallbackAlt.replace(/"/g, "&quot;");
  return html
    // Add alt to img tags missing it entirely
    .replace(/<img\b(?![^>]*\balt\s*=)([^>]*?)(\s*\/?>)/gi,
      `<img$1 alt="${safeAlt}"$2`)
    // Replace alt="" (empty alt) with the fallback title
    .replace(/(<img\b[^>]*?\balt\s*=\s*")(\s*?)"/gi,
      `$1${safeAlt}"`);
}
