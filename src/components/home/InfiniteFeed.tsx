"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleCardSkeleton } from "@/components/article/ArticleCardSkeleton";
import { useInfiniteArticles } from "@/hooks/useInfiniteArticles";
import { StickyMobileAd } from "@/components/ads/StickyMobileAd";

interface InfiniteFeedProps {
  initialCategory?: string;
}

export function InfiniteFeed({ initialCategory }: InfiniteFeedProps) {
  const { articles, hasMore, loadMore, isLoading, isValidating, size } = useInfiniteArticles(initialCategory);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const router      = useRouter();

  // Update URL as user scrolls — page 2+ gets /?page=N
  useEffect(() => {
    if (size <= 1) return;
    router.replace(`/?page=${size}`, { scroll: false });
  }, [size, router]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore && !isValidating) loadMore(); },
      { rootMargin: "300px" }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isValidating, loadMore]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {articles.map((article) =>
          article?._id ? (
            <ArticleCard key={article._id} article={article} variant="horizontal" />
          ) : null
        )}
      </div>

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-1" />

      {isValidating && (
        <div className="flex justify-center py-8">
          <Loader2 size={20} className="animate-spin text-muted-fg" />
        </div>
      )}

      {!hasMore && articles.length > 0 && (
        <p className="text-center text-sm text-muted-fg py-8">
          You&apos;re all caught up! ✓
        </p>
      )}

      <StickyMobileAd />
    </>
  );
}
