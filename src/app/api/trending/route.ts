import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import ArticleModel from "@/lib/db/models/Article";
import "@/lib/db/models/Author";   // register Author schema for populate()
import "@/lib/db/models/Category"; // register Category schema for populate()
import { cacheGet, cacheSet } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cached = await cacheGet<{ data: unknown[] }>('trending')
    if (cached) {
      return NextResponse.json(cached, {
        headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60" },
      })
    }

    await dbConnect();

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const articles = await ArticleModel.find({
      status: "published",
      publishedAt: { $gte: since },
    })
      .populate("category", "name slug color")
      .populate("author", "name slug avatar")
      .sort({ views: -1 })
      .limit(10)
      .select("title slug excerpt featuredImage category author tags readingTime views publishedAt")
      .lean()
      .exec();

    const result = { data: articles }
    await cacheSet('trending', result, 600)
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("[GET /api/trending]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
