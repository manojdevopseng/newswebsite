import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCategoryBySlug, categories } from "@/config/categories";
import { generateCategoryMetadata } from "@/lib/seo/metadata";
import { ArticleCard } from "@/components/article/ArticleCard";
import { AdBanner } from "@/components/ads/AdBanner";
import { NewsletterCTA } from "@/components/home/NewsletterCTA";
import dbConnect from "@/lib/db/mongoose";
import ArticleModel from "@/lib/db/models/Article";
import CategoryModel from "@/lib/db/models/Category";
import "@/lib/db/models/Author";
import type { ArticlePreview } from "@/types";

// Revalidate category pages every hour
export const revalidate = 3600;

const PAGE_1_SIZE = 20; // featured(2-col) + 19 regular = perfect grid
const PAGE_N_SIZE = 21; // 7 rows × 3 cols = perfect grid for page 2+

interface Params       { category: string }
interface SearchParams { page?: string }

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params:       Promise<Params>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "Not Found" };

  const sp   = await searchParams;
  const page = parseInt(sp.page || "1");
  const base = generateCategoryMetadata(category);

  // For paginated pages (page 2+), set canonical to include the page number
  // so Google indexes each page as a distinct URL, not a duplicate of page 1
  if (page > 1) {
    const { siteConfig } = await import("@/config/site");
    return {
      ...base,
      alternates: {
        canonical: `${siteConfig.url}/${slug}?page=${page}`,
      },
    };
  }

  return base;
}

function getSkipAndLimit(page: number) {
  if (page === 1) return { skip: 0, limit: PAGE_1_SIZE };
  const skip = PAGE_1_SIZE + (page - 2) * PAGE_N_SIZE;
  return { skip, limit: PAGE_N_SIZE };
}

function getTotalPages(total: number) {
  if (total <= PAGE_1_SIZE) return Math.min(1, total > 0 ? 1 : 0);
  return 1 + Math.ceil((total - PAGE_1_SIZE) / PAGE_N_SIZE);
}

async function getCategoryArticles(slug: string, page: number): Promise<{ articles: ArticlePreview[]; total: number }> {
  try {
    await dbConnect();
    const cat = await CategoryModel.findOne({ slug }).lean();
    if (!cat) return { articles: [], total: 0 };

    const filter = { category: (cat as any)._id, status: "published" };
    const { skip, limit } = getSkipAndLimit(page);
    const [articles, total] = await Promise.all([
      ArticleModel.find(filter)
        .populate("category", "name slug color")
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      ArticleModel.countDocuments(filter),
    ]);

    return {
      articles: articles
        .filter((a: any) => a.category)
        .map((a: any) => ({
          ...a,
          _id:      a._id?.toString(),
          category: { ...a.category, _id: a.category._id?.toString() },
        })) as ArticlePreview[],
      total,
    };
  } catch { return { articles: [], total: 0 }; }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params:       Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const sp   = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));

  const { articles, total } = await getCategoryArticles(slug, page);
  const totalPages = getTotalPages(total);

  const [featured, ...rest] = articles;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Category header */}
      <header className="mb-10">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{ backgroundColor: `${category.color}18`, color: category.color, border: `1px solid ${category.color}30` }}
        >
          {category.name}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold">{category.name} News & Analysis</h1>
        <p className="mt-2 text-muted-fg text-lg">{category.description}</p>
        {total > 0 && (
          <p className="mt-1 text-sm text-muted-fg">{total} articles</p>
        )}
      </header>

      {/* Ad slot */}
      <AdBanner slot={`category-${slug}-top`} size="leaderboard" className="mb-10" />

      {/* Article grid */}
      {articles.length === 0 ? (
        <div className="text-center text-muted-fg py-20">
          <p className="text-lg">No articles yet in this category.</p>
          <p className="text-sm mt-1">Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {page === 1 && featured && (
            <ArticleCard article={featured} variant="featured" priority className="md:col-span-2 lg:col-span-2" />
          )}
          {(page === 1 ? rest : articles).map((article, i) => (
            <ArticleCard key={article._id} article={article} priority={i < 3} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          {/* Prev */}
          {page > 1 ? (
            <Link
              href={`/${slug}?page=${page - 1}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              <ChevronLeft size={16} /> Prev
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-fg cursor-not-allowed opacity-40">
              <ChevronLeft size={16} /> Prev
            </span>
          )}

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | "...")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-muted-fg text-sm">…</span>
                ) : (
                  <Link
                    key={p}
                    href={`/${slug}?page=${p}`}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? "bg-accent text-white"
                        : "border border-border hover:bg-muted"
                    }`}
                  >
                    {p}
                  </Link>
                )
              )}
          </div>

          {/* Next */}
          {page < totalPages ? (
            <Link
              href={`/${slug}?page=${page + 1}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Next <ChevronRight size={16} />
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-fg cursor-not-allowed opacity-40">
              Next <ChevronRight size={16} />
            </span>
          )}
        </div>
      )}

      {/* Newsletter */}
      <NewsletterCTA />
    </div>
  );
}
