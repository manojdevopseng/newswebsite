import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import ArticleModel from "@/lib/db/models/Article";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();

    const articles = await ArticleModel.find(
      { status: "published", tags: { $exists: true, $ne: [] } },
      { tags: 1, views: 1 }
    )
      .sort({ views: -1 })
      .limit(30)
      .lean()
      .exec() as any[];

    const freq: Record<string, number> = {};
    for (const a of articles) {
      for (const tag of (a.tags ?? [])) {
        freq[tag] = (freq[tag] ?? 0) + 1;
      }
    }

    const trending = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag]) => tag);

    return NextResponse.json(
      { trending: trending.length ? trending : ["AI 2026", "Nifty 50", "UPI", "Startup India", "Crypto", "AWS"] },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300" } }
    );
  } catch {
    return NextResponse.json({
      trending: ["AI 2026", "Nifty 50", "UPI", "Startup India", "Crypto", "AWS"],
    });
  }
}
