import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import ArticleModel from "@/lib/db/models/Article";
import CategoryModel from "@/lib/db/models/Category";
import "@/lib/db/models/Author";
import { cacheGet, cacheSet } from "@/lib/cache";
export const dynamic = "force-dynamic";

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q        = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? undefined;
  const limit    = Math.min(20, Number(searchParams.get("limit") ?? 10));

  if (!q.trim()) {
    return NextResponse.json({ hits: [], query: q, total: 0 });
  }

  try {
    const normalized = q.trim().toLowerCase().slice(0, 100)
    const cacheKey   = `search:${normalized}:${category ?? ''}:${limit}`
    const cached     = await cacheGet<{ hits: unknown[], query: string, total: number }>(cacheKey)
    if (cached) return NextResponse.json(cached)

    await dbConnect();

    const safe = escapeRegex(q.trim().slice(0, 100));

    const filter: Record<string, unknown> = {
      status:      "published",
      publishedAt: { $lte: new Date() },
      $or: [
        { title:   { $regex: safe, $options: "i" } },
        { excerpt: { $regex: safe, $options: "i" } },
        { tags:    { $regex: safe, $options: "i" } },
      ],
    };

    if (category) {
      const cat = await CategoryModel.findOne({ slug: category }).lean() as any;
      if (cat) filter.category = cat._id;
    }

    const articles = await ArticleModel.find(filter)
      .populate("category", "name slug")
      .select("title slug excerpt featuredImage category publishedAt")
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    const hits = (articles as any[])
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

    const result = { hits, query: q, total: hits.length }
    await cacheSet(cacheKey, result, 300)
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[GET /api/search]", err);
    return NextResponse.json({ hits: [], error: err.message, query: q, total: 0 });
  }
}
