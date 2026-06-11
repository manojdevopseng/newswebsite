"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { categories } from "@/config/categories";

const VALID_CATEGORY_SLUGS = new Set(categories.map((c) => c.slug));

/**
 * EN | हि language switcher — shown only on article pages.
 * /ai/article-slug       ↔  /hi/ai/article-slug
 */
export function LanguageToggle() {
  const pathname = usePathname();
  const router   = useRouter();

  const isHindi   = pathname.startsWith("/hi/");
  const cleanPath = isHindi ? pathname.slice(3) : pathname; // strip /hi prefix
  const parts     = cleanPath.split("/").filter(Boolean);

  // Only render on article pages: /{category}/{slug} or /hi/{category}/{slug}
  // Validate that first segment is a real category slug (prevents rendering on
  // /preview/[id], /admin/*, /search, /authors/* etc.)
  if (parts.length !== 2) return null;
  if (!VALID_CATEGORY_SLUGS.has(parts[0])) return null;

  function goEnglish() {
    if (isHindi) router.push(cleanPath);
  }

  function goHindi() {
    if (!isHindi) router.push(`/hi${pathname}`);
  }

  return (
    <div
      className="flex items-center rounded-lg border border-white/[0.08] overflow-hidden text-xs font-medium"
      title="Switch language"
    >
      <button
        onClick={goEnglish}
        className={cn(
          "px-2.5 py-1.5 transition-colors duration-150",
          !isHindi
            ? "bg-accent text-white"
            : "text-muted-fg hover:text-foreground hover:bg-muted"
        )}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={goHindi}
        className={cn(
          "px-2.5 py-1.5 transition-colors duration-150 border-l border-white/[0.08]",
          isHindi
            ? "bg-accent text-white"
            : "text-muted-fg hover:text-foreground hover:bg-muted"
        )}
        aria-label="हिन्दी में पढ़ें"
      >
        हि
      </button>
    </div>
  );
}
