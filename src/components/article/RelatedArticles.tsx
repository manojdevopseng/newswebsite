import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ArticleCard } from "./ArticleCard";
import type { ArticlePreview } from "@/types";

interface RelatedArticlesProps {
  articles: ArticlePreview[];
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (!articles.length) return null;

  return (
    <section className="mt-16 pt-10 border-t border-border">
      <div className="flex items-center gap-2.5 mb-7">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-purple/10">
          <Sparkles size={15} className="text-accent-purple" />
        </div>
        <h2 className="text-xl font-bold">Related Articles</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.slice(0, 3).map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </div>
    </section>
  );
}
