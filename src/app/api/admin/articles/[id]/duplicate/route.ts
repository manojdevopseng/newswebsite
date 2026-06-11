import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/admin/auth";
import dbConnect from "@/lib/db/mongoose";
import ArticleModel from "@/lib/db/models/Article";
import { logActivity } from "@/lib/admin/activity";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await dbConnect();

  const original = await ArticleModel.findById(id).lean() as any;
  if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { _id, createdAt, updatedAt, views, viewsByDate, commentCount, ...rest } = original;

  const newSlug = `${rest.slug}-copy-${Date.now().toString(36)}`;
  const duplicate = await ArticleModel.create({
    ...rest,
    title:       `Copy of ${rest.title}`,
    slug:        newSlug,
    status:      "draft",
    publishedAt: null,
    views:       0,
    commentCount: 0,
    viewsByDate: {},
  });

  logActivity({ action: "article.created", entityType: "article", entityId: duplicate._id.toString(), entityTitle: duplicate.title, details: `Duplicated from "${rest.title}"` });

  return NextResponse.json({ data: { _id: duplicate._id.toString() } }, { status: 201 });
}
