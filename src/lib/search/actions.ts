import type { SearchResult } from "@/types";
import { escapeRegex } from "@/lib/sanitize";
import dbConnect from "@/lib/db/mongoose";
import ArticleModel from "@/lib/db/models/Article";
import CategoryModel from "@/lib/db/models/Category";
import "@/lib/db/models/Author";

/* ─── Core MongoDB search ─────────────────────────────────── */
export async function searchArticles(
  query: string,
  options?: { category?: string; limit?: number }
): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  try {
    await dbConnect();

    const limit  = options?.limit ?? 10;
    const safe   = escapeRegex(query.trim().slice(0, 100));

    const filter: Record<string, unknown> = {
      status:      "published",
      publishedAt: { $lte: new Date() },
      $or: [
        { title:   { $regex: safe, $options: "i" } },
        { excerpt: { $regex: safe, $options: "i" } },
        { tags:    { $regex: safe, $options: "i" } },
      ],
    };

    if (options?.category) {
      const cat = await CategoryModel.findOne({ slug: options.category }).lean() as any;
      if (cat) filter.category = cat._id;
    }

    const articles = await ArticleModel.find(filter)
      .populate("category", "name slug")
      .select("title slug excerpt featuredImage category publishedAt tags")
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    return (articles as any[])
      .filter((a) => a.category?.slug)
      .map((a) => ({
        id:            a._id.toString(),
        title:         a.title        ?? "",
        slug:          a.slug         ?? "",
        excerpt:       a.excerpt      ?? "",
        category:      a.category.name,
        categorySlug:  a.category.slug,
        publishedAt:   a.publishedAt?.toISOString() ?? "",
        featuredImage: a.featuredImage || undefined,
      }));
  } catch (err) {
    console.error("[searchArticles]", err);
    return [];
  }
}
