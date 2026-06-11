import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import CategoryModel from "@/lib/db/models/Category";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const categories = await CategoryModel.find().lean().exec();
    return NextResponse.json(
      { data: categories },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300" } }
    );
  } catch (err) {
    console.error("[GET /api/categories]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
