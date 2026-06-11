import Link from "next/link";
import { Clock, Eye, MessageCircle } from "lucide-react";
import { cn, formatRelativeDate, formatNumber } from "@/lib/utils";
import { CategoryBadge } from "./CategoryBadge";
import { SafeImage } from "./SafeImage";
import type { ArticlePreview } from "@/types";

interface ArticleCardProps {
  article: ArticlePreview;
  variant?: "default" | "featured" | "compact" | "horizontal";
  className?: string;
  priority?: boolean;
}

export function ArticleCard({ article, variant = "default", className, priority = false }: ArticleCardProps) {
  if (!article?.category) return null;

  const href = `/${article.category.slug}/${article.slug}`;
  const categoryName = article.category.name;
  const categorySlug = article.category.slug;

  if (variant === "compact") {
    return (
      <Link
        href={href}
        className={cn(
          "flex gap-3 p-3 rounded-xl group transition-colors hover:bg-muted",
          className
        )}
      >
        {article.featuredImage && (
          <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-muted">
            <SafeImage
              src={article.featuredImage}
              alt={article.title}
              fill
              className="object-cover"
              sizes="64px"
              quality={70}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <CategoryBadge slug={categorySlug} name={categoryName} size="sm" asLink={false} />
          <h3 className="mt-1 text-sm font-semibold line-clamp-2 group-hover:text-accent transition-colors">
            {article.title}
          </h3>
          <p className="mt-0.5 text-xs text-muted-fg">{formatRelativeDate(article.publishedAt)}</p>
        </div>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link
        href={href}
        className={cn(
          "flex gap-4 p-4 rounded-2xl bg-card border border-border group card-glow",
          className
        )}
      >
        {article.featuredImage && (
          <div className="relative w-24 h-24 sm:w-32 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-muted">
            <SafeImage
              src={article.featuredImage}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 96px, 128px"
              quality={70}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <CategoryBadge slug={categorySlug} name={categoryName} size="sm" asLink={false} />
          <h3 className="mt-1.5 font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-accent transition-colors">
            {article.title}
          </h3>
          <p className="mt-1 text-xs text-muted-fg line-clamp-2 hidden sm:block">{article.excerpt}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-fg">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {article.readingTime}m read
            </span>
            <span>{formatRelativeDate(article.publishedAt)}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link
        href={href}
        className={cn(
          "group relative flex flex-col rounded-2xl overflow-hidden bg-card border border-border card-glow",
          "md:col-span-2 lg:col-span-2",
          className
        )}
      >
        {article.featuredImage && (
          <div className="relative h-56 sm:h-72 bg-muted">
            <SafeImage
              src={article.featuredImage}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 66vw"
              quality={75}
              priority={priority}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        )}
        <div className="p-5">
          <CategoryBadge slug={categorySlug} name={categoryName} asLink={false} />
          <h2 className="mt-2 text-xl font-bold line-clamp-2 group-hover:text-accent transition-colors">
            {article.title}
          </h2>
          <p className="mt-2 text-sm text-muted-fg line-clamp-2">{article.excerpt}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-fg">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {article.readingTime}m read
            </span>
            <span className="flex items-center gap-1">
              <Eye size={12} />
              {formatNumber(article.views)}
            </span>
            <span>{formatRelativeDate(article.publishedAt)}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Default card
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col rounded-2xl overflow-hidden bg-card border border-border card-glow",
        className
      )}
    >
      {article.featuredImage && (
        <div className="relative h-44 bg-muted overflow-hidden">
          <SafeImage
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={75}
            priority={priority}
          />
        </div>
      )}
      <div className="flex flex-col flex-1 p-4">
        <CategoryBadge slug={categorySlug} name={categoryName} size="sm" asLink={false} />
        <h3 className="mt-2 font-semibold text-base line-clamp-2 group-hover:text-accent transition-colors">
          {article.title}
        </h3>
        <p className="mt-1.5 text-sm text-muted-fg line-clamp-2 flex-1">{article.excerpt}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-fg">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {article.readingTime}m
          </span>
          <span className="flex items-center gap-1">
            <Eye size={11} />
            {formatNumber(article.views)}
          </span>
          {(article.commentCount ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <MessageCircle size={11} />
              {article.commentCount}
            </span>
          )}
          <span className="ml-auto">{formatRelativeDate(article.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
