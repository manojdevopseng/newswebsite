import Link from "next/link";
import { Flame } from "lucide-react";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleCardSkeleton } from "@/components/article/ArticleCardSkeleton";
import { InFeedAd } from "@/components/ads/InFeedAd";
import type { ArticlePreview } from "@/types";

interface TrendingGridProps {
  articles: ArticlePreview[];
  isLoading?: boolean;
}

export function TrendingGrid({ articles, isLoading }: TrendingGridProps) {
  const [featured, ...rest] = articles;

  return (
    <section className="py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-orange/10">
              <Flame size={16} className="text-accent-orange" />
            </div>
            <h2 className="text-xl font-bold">Trending Now</h2>
          </div>
          <Link
            href="/ai"
            className="text-sm text-muted-fg hover:text-accent transition-colors flex items-center gap-1"
          >
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <ArticleCardSkeleton className="md:col-span-2 lg:col-span-2" />
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Featured — LCP candidate, render immediately with priority */}
            {featured && (
              <div className="md:col-span-2 lg:col-span-2">
                <ArticleCard article={featured} variant="featured" priority className="h-full" />
              </div>
            )}

            {/* Rest of articles */}
            {rest.slice(0, 8).map((article, i) => {
              const showAd = (i + 1) % 4 === 0;
              return (
                <div key={article._id}>
                  <ArticleCard article={article} className="h-full" />
                  {showAd && <InFeedAd className="mt-5" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
