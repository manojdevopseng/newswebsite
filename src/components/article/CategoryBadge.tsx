import Link from "next/link";
import { cn } from "@/lib/utils";
import { getCategoryColor } from "@/config/categories";

interface CategoryBadgeProps {
  slug: string;
  name: string;
  className?: string;
  asLink?: boolean;
  size?: "sm" | "md";
}

export function CategoryBadge({ slug, name, className, asLink = true, size = "md" }: CategoryBadgeProps) {
  const color = getCategoryColor(slug);

  const badge = (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-full uppercase tracking-wide",
        "transition-opacity duration-150",
        size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1",
        className
      )}
      style={{
        backgroundColor: `${color}18`,
        color: color,
        borderColor: `${color}30`,
        border: "1px solid",
      }}
    >
      {name}
    </span>
  );

  if (!asLink) return badge;

  return (
    <Link href={`/${slug}`} className="hover:opacity-80 transition-opacity">
      {badge}
    </Link>
  );
}
