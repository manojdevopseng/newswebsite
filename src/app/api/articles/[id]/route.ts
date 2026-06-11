export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/db/mongoose";
import ArticleModel from "@/lib/db/models/Article";
import "@/lib/db/models/Author"; // register Author schema for populate()
import "@/lib/db/models/Category"; // register Category schema for populate()
import { cacheGet, cacheSet } from "@/lib/cache";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cached = await cacheGet<{ data: unknown }>(`article:${id}`)
    if (cached) return NextResponse.json(cached)

    await dbConnect();
    const isObjectId = Types.ObjectId.isValid(id) && String(new Types.ObjectId(id)) === id;
    const article = await ArticleModel.findOne({
      ...(isObjectId ? { $or: [{ _id: id }, { slug: id }] } : { slug: id }),
      status: "published",
    })
      .populate("category", "name slug color description")
      .populate("author", "name slug avatar bio twitter linkedin expertise")
      .lean()
      .exec();

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Increment views fire-and-forget
    const articleDoc = article as any;
    ArticleModel.updateOne({ _id: articleDoc._id }, { $inc: { views: 1 } }).exec().catch(() => {});

    // Serialize ObjectIds to strings
    const serialized = {
      ...articleDoc,
      _id:      articleDoc._id?.toString(),
      category: articleDoc.category
        ? { ...articleDoc.category, _id: articleDoc.category._id?.toString() }
        : null,
      author: articleDoc.author
        ? { ...articleDoc.author, _id: articleDoc.author._id?.toString() }
        : null,
    };

    const result = { data: serialized }
    // Cache by both the lookup key and the slug so either lookup hits cache
    const saves: Promise<void>[] = [cacheSet(`article:${id}`, result, 120)]
    if (serialized.slug && serialized.slug !== id) {
      saves.push(cacheSet(`article:${serialized.slug}`, result, 120))
    }
    await Promise.all(saves)

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/articles/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
