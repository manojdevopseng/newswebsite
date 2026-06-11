import { Suspense } from "react";
import { HeroSection } from "@/components/home/HeroSection";

// Cache homepage for 5 minutes — serves from Vercel CDN instead of hitting MongoDB every request
export const revalidate = 300;
import { LiveTicker } from "@/components/home/LiveTicker";
import { TrendingGrid } from "@/components/home/TrendingGrid";
import { CategorySection } from "@/components/home/CategorySection";
import { NewsletterCTA } from "@/components/home/NewsletterCTA";
import { InfiniteFeed } from "@/components/home/InfiniteFeed";
import { AdBanner } from "@/components/ads/AdBanner";
import { getCategoryBySlug, categories } from "@/config/categories";
import dbConnect from "@/lib/db/mongoose";
import ArticleModel from "@/lib/db/models/Article";
import CategoryModel from "@/lib/db/models/Category";
import "@/lib/db/models/Author";
import type { ArticlePreview } from "@/types";

const CATEGORY_EMOJI: Record<string, string> = {
  ai:          "🤖",
  finance:     "📈",
  technology:  "💻",
  startups:    "🚀",
  crypto:      "🔗",
  "cloud-aws": "☁️",
  investing:   "💰",
  automation:  "⚡",
};

async function fetchTickerHeadlines(): Promise<string[]> {
  try {
    await dbConnect();
    const articles = await ArticleModel.find({ status: "published" })
      .populate("category", "slug")
      .select("title category")
      .sort({ publishedAt: -1 })
      .limit(15)
      .lean()
      .exec();
    return articles.map((a: any) => {
      const emoji = CATEGORY_EMOJI[(a.category as any)?.slug ?? ""] ?? "📰";
      return `${emoji} ${a.title}`;
    });
  } catch { return []; }
}

async function fetchArticles(opts?: { category?: string; sort?: string; limit?: number }): Promise<ArticlePreview[]> {
  try {
    await dbConnect();
    const limit = opts?.limit ?? 9;
    let categoryId: any = undefined;
    if (opts?.category) {
      const cat = await CategoryModel.findOne({ slug: opts.category }).lean();
      if (!cat) return [];
      categoryId = (cat as any)._id;
    }
    const query: any = { status: "published" };
    if (categoryId) query.category = categoryId;
    const sortOrder = opts?.sort === "trending" ? "-views -publishedAt" : "-publishedAt";
    const articles = await ArticleModel.find(query)
      .populate("category", "name slug color")
      .sort(sortOrder)
      .limit(limit)
      .lean()
      .exec();
    return articles.map((a: any) => ({
      ...a,
      _id:      a._id?.toString(),
      category: a.category ? { ...a.category, _id: a.category._id?.toString() } : null,
    })) as ArticlePreview[];
  } catch { return []; }
}

export default async function HomePage() {
  const [trending, aiArticles, financeArticles, techArticles, tickerHeadlines] = await Promise.all([
    fetchArticles({ sort: "trending", limit: 9 }),
    fetchArticles({ category: "ai", limit: 4 }),
    fetchArticles({ category: "finance", limit: 4 }),
    fetchArticles({ category: "technology", limit: 4 }),
    fetchTickerHeadlines(),
  ]);

  const featuredArticle = trending[0];
  const aiCat = getCategoryBySlug("ai")!;
  const financeCat = getCategoryBySlug("finance")!;
  const techCat = getCategoryBySlug("technology")!;

  return (
    <>
      {/* Hero */}
      <HeroSection featuredArticle={featuredArticle} />

      {/* Live Ticker */}
      <LiveTicker headlines={tickerHeadlines} />

      {/* Hero ad slot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdBanner slot="homepage-hero" size="leaderboard" />
      </div>

      {/* Trending news grid */}
      <TrendingGrid articles={trending} />

      {/* AI Intelligence Section */}
      <CategorySection category={aiCat} articles={aiArticles} />

      {/* Finance Intelligence Section */}
      <CategorySection category={financeCat} articles={financeArticles} />

      {/* Finance ad slot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 pb-10">
        <AdBanner slot="homepage-mid" size="leaderboard" />
      </div>

      {/* Tech & Startups Section */}
      <CategorySection category={techCat} articles={techArticles} />

      {/* Newsletter CTA */}
      <NewsletterCTA />

      {/* Infinite feed */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold mb-7">Latest Stories</h2>
          <Suspense fallback={<div className="h-48 skeleton rounded-2xl" />}>
            <InfiniteFeed />
          </Suspense>
        </div>
      </section>
    </>
  );
}
