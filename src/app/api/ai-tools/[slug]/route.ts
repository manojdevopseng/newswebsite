import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import AIToolModel from "@/lib/db/models/AITool";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    const { slug } = await params;

    const tool = await AIToolModel.findOne({ slug }).lean().exec();

    if (!tool) {
      return NextResponse.json({ error: "AI tool not found" }, { status: 404 });
    }

    return NextResponse.json(
      { data: tool },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300" } }
    );
  } catch (err) {
    console.error("[GET /api/ai-tools/:slug]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
