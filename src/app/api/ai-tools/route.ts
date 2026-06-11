import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import AIToolModel from "@/lib/db/models/AITool";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "";
    const pricing = searchParams.get("pricing") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (pricing) filter.pricing = pricing;

    const [tools, total] = await Promise.all([
      AIToolModel.find(filter)
        .sort({ rating: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      AIToolModel.countDocuments(filter),
    ]);

    return NextResponse.json(
      { data: tools, total, page, hasMore: page * limit < total },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (err) {
    console.error("[GET /api/ai-tools]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
