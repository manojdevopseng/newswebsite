import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import ArticleModel from "@/lib/db/models/Article";
import CategoryModel from "@/lib/db/models/Category";
import "@/lib/db/models/Author"; // register Author schema for populate()
import type { PaginatedResponse, ArticlePreview } from "@/types";
import { cacheGet, cacheSet, getListingsVersion } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page     = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit    = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 10)));
    const category = searchParams.get("category");
    const sort     = searchParams.get("sort") ?? "latest";
    const skip     = (page - 1) * limit;

    // Fetch by IDs (for bookmarks page) — skip cache for personalised lookups
    const ids = searchParams.get("ids")
    if (ids) {
      const idList = ids.split(",").filter(Boolean).slice(0, 50)
      const articles = await ArticleModel.find({ _id: { $in: idList }, status: "published" })
        .populate("category", "name slug color")
        .populate("author",   "name slug avatar")
        .select("title slug excerpt featuredImage category author tags readingTime views publishedAt commentCount")
        .lean()
        .exec()
      const serialized = (articles as any[]).filter(a => a?.category).map(a => ({
        ...a,
        _id:      a._id.toString(),
        category: { ...a.category, _id: a.category._id?.toString() },
        author:   a.author ? { ...a.author, _id: a.author._id?.toString() } : null,
      }))
      return NextResponse.json({ data: serialized, total: serialized.length, page: 1, limit: 50, hasMore: false })
    }

    // Redis cache check — version key lets us bust all listings with a single INCR
    const version  = await getListingsVersion()
    const cacheKey = `articles:v${version}:p${page}:l${limit}:c${category ?? 'all'}:s${sort}`
    const cached   = await cacheGet<PaginatedResponse<ArticlePreview>>(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
      })
    }

    const query: Record<string, unknown> = { status: "published" };

    // Category filter: resolve slug → ObjectId first (category field is a ref, not embedded)
    if (category) {
      const cat = await CategoryModel.findOne({ slug: category }).select("_id").lean() as any;
      if (cat) {
        query.category = cat._id;
      } else {
        // Unknown category slug — return empty
        return NextResponse.json(
          { data: [], total: 0, page, limit, hasMore: false },
          { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" } }
        );
      }
    }

    const sortObj: Record<string, 1 | -1> =
      sort === "trending" ? { views: -1 } : { publishedAt: -1 };

    const [articles, total] = await Promise.all([
      ArticleModel.find(query)
        .populate("category", "name slug color")
        .populate("author",   "name slug avatar")
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .select("title slug excerpt featuredImage category author tags readingTime views publishedAt")
        .lean()
        .exec(),
      ArticleModel.countDocuments(query),
    ]);

    // Serialize _id fields to strings and filter out any docs with missing refs
    const serialized = (articles as any[])
      .filter((a) => a && a._id)
      .map((a) => ({
        ...a,
        _id:      a._id.toString(),
        category: a.category
          ? { ...a.category, _id: a.category._id?.toString() }
          : null,
        author: a.author
          ? { ...a.author, _id: a.author._id?.toString() }
          : null,
      }))
      .filter((a) => a.category !== null); // drop articles with deleted categories

    const response: PaginatedResponse<ArticlePreview> = {
      data:    serialized as unknown as ArticlePreview[],
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    };

    await cacheSet(cacheKey, response, 300)
    return NextResponse.json(response, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("[GET /api/articles]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
