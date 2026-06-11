import Link from "next/link";
import { Brain, TrendingUp, Cpu, Rocket, Zap, Cloud, BarChart3, Bitcoin, Circle, type LucideProps } from "lucide-react";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleCardSkeleton } from "@/components/article/ArticleCardSkeleton";
import type { ArticlePreview } from "@/types";
import type { Category } from "@/config/categories";
import type { FC } from "react";

interface CategorySectionProps {
  category: Category;
  articles: ArticlePreview[];
  isLoading?: boolean;
}

const ICON_MAP: Record<string, FC<LucideProps>> = {
  Brain, TrendingUp, Cpu, Rocket, Zap, Cloud, BarChart3, Bitcoin,
};

export function CategorySection({ category, articles, isLoading }: CategorySectionProps) {
  const IconComponent = ICON_MAP[category.icon] ?? Circle;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl"
              style={{ backgroundColor: `${category.color}18` }}
            >
              <IconComponent size={18} style={{ color: category.color }} />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight">{category.name}</h2>
              <p className="text-xs text-muted-fg">{category.description}</p>
            </div>
          </div>
          <Link
            href={`/${category.slug}`}
            className="text-sm font-medium hover:text-accent transition-colors flex items-center gap-1"
            style={{ color: category.color }}
          >
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 scrollbar-hide">
            {articles.slice(0, 4).map((article) => (
              <div key={article._id} className="min-w-[260px] sm:min-w-0">
                <ArticleCard article={article} className="h-full" />
              </div>
            ))}
          </div>
        )}

        <div className="section-divider mt-12" />
      </div>
    </section>
  );
}
