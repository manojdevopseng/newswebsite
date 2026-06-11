export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/admin/auth";
import dbConnect from "@/lib/db/mongoose";
import CommentModel from "@/lib/db/models/Comment";
import ArticleModel from "@/lib/db/models/Article";
import { logActivity } from "@/lib/admin/activity";
import { escapeRegex } from "@/lib/sanitize";

// ─── GET /api/admin/comments?status=pending&page=1&search=xxx ────────────────
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = req.nextUrl.searchParams.get("status") || "pending";
  const page   = parseInt(req.nextUrl.searchParams.get("page") || "1");
  const search = req.nextUrl.searchParams.get("search")?.trim() || "";
  const limit  = 20;

  await dbConnect();

  const baseFilter = status === "all"      ? {}
                   : status === "reported" ? { reported: true }
                   : { status };
  const safe   = escapeRegex(search.slice(0, 100))
  const filter = search
    ? { ...baseFilter, $or: [
        { name:    { $regex: safe, $options: "i" } },
        { content: { $regex: safe, $options: "i" } },
      ]}
    : baseFilter;

  const [comments, total, pendingCount, approvedCount, spamCount, reportedCount] = await Promise.all([
    CommentModel.find(filter)
      .sort({ pinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    CommentModel.countDocuments(filter),
    CommentModel.countDocuments({ status: "pending" }),
    CommentModel.countDocuments({ status: "approved" }),
    CommentModel.countDocuments({ status: "spam" }),
    CommentModel.countDocuments({ reported: true, status: "approved" }),
  ]);

  // Attach article titles
  const articleIds = [...new Set(comments.map((c: any) => c.articleId?.toString()))];
  const articles   = await ArticleModel.find({ _id: { $in: articleIds } })
    .select("title slug")
    .lean();
  const articleMap = Object.fromEntries(articles.map((a: any) => [a._id.toString(), a]));

  // Attach parent comment excerpts for replies
  const parentIds = [...new Set(
    comments.filter((c: any) => c.parentId).map((c: any) => c.parentId.toString())
  )];
  const parents = parentIds.length > 0
    ? await CommentModel.find({ _id: { $in: parentIds } }).select("_id content name").lean()
    : [];
  const parentMap = Object.fromEntries(parents.map((p: any) => [p._id.toString(), p]));

  return NextResponse.json({
    comments: comments.map((c: any) => {
      const parent = c.parentId ? parentMap[c.parentId.toString()] : null;
      return {
        _id:           c._id.toString(),
        name:          c.name,
        email:         c.email,
        content:       c.content,
        status:        c.status,
        parentId:      c.parentId?.toString() || null,
        parentExcerpt: parent ? parent.content.slice(0, 80) : null,
        parentName:    parent ? parent.name : null,
        ip:            c.ip ? c.ip.replace(/\.\d+$/, '.***') : null, // mask last octet
        createdAt:     c.createdAt,
        likes:         c.likes || 0,
        pinned:        c.pinned || false,
        reported:      c.reported || false,
        reportCount:   c.reportCount || 0,
        article:       articleMap[c.articleId?.toString()] || null,
      };
    }),
    total,
    pendingCount,
    approvedCount,
    spamCount,
    reportedCount,
    totalCount: pendingCount + approvedCount + spamCount,
    page,
    hasMore: page * limit < total,
  });
}

// ─── PATCH /api/admin/comments  { id, status } or { id, pinned } ─────────────
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await dbConnect();

  // ── Pin / Unpin ──────────────────────────────────────────────────────────────
  if (typeof body.pinned === "boolean") {
    const c = await CommentModel.findById(id).select("name").lean() as any;
    await CommentModel.updateOne({ _id: id }, { $set: { pinned: body.pinned } });
    logActivity({
      action:      body.pinned ? "comment.pinned" : "comment.unpinned",
      entityType:  "comment",
      entityId:    id,
      entityTitle: c?.name ?? id,
    });
    return NextResponse.json({ success: true });
  }

  // ── Status change ────────────────────────────────────────────────────────────
  const { status } = body;
  if (!["approved", "pending", "spam"].includes(status))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  // Fetch old status to figure out commentCount delta
  const old = await CommentModel.findById(id).select("status parentId articleId name").lean() as any;
  if (!old) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

  await CommentModel.updateOne({ _id: id }, { $set: { status } });
  logActivity({
    action:      `comment.${status}`,
    entityType:  "comment",
    entityId:    id,
    entityTitle: old?.name ?? id,
  });

  // Update article commentCount (only top-level comments count)
  if (!old.parentId) {
    const wasApproved = old.status === "approved";
    const isApproved  = status === "approved";
    if (!wasApproved && isApproved) {
      await ArticleModel.updateOne({ _id: old.articleId }, { $inc: { commentCount: 1 } });
    } else if (wasApproved && !isApproved) {
      await ArticleModel.updateOne({ _id: old.articleId }, { $inc: { commentCount: -1 } });
    }
  }

  return NextResponse.json({ success: true });
}

// ─── DELETE /api/admin/comments  { id } ──────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await dbConnect();

  const comment = await CommentModel.findById(id).select("status parentId articleId").lean() as any;
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete comment + all its replies
  await CommentModel.deleteMany({ $or: [{ _id: id }, { parentId: id }] });

  // Decrement commentCount if it was an approved top-level comment
  if (!comment.parentId && comment.status === "approved") {
    await ArticleModel.updateOne({ _id: comment.articleId }, { $inc: { commentCount: -1 } });
  }

  logActivity({
    action:      "comment.deleted",
    entityType:  "comment",
    entityId:    id,
    entityTitle: comment?.name ?? id,
  });

  return NextResponse.json({ success: true });
}
