import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/admin/auth";
import dbConnect from "@/lib/db/mongoose";
import CommentModel from "@/lib/db/models/Comment";
import ArticleModel from "@/lib/db/models/Article";
import { logActivity } from "@/lib/admin/activity";

// POST /api/admin/comments/bulk  { action: 'approve-pending' | 'delete-spam' }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action } = await req.json();

  await dbConnect();

  if (action === "approve-pending") {
    // Fetch all pending comments
    const pending = await CommentModel.find({ status: "pending" })
      .select("_id articleId parentId")
      .lean();

    if (pending.length === 0)
      return NextResponse.json({ success: true, count: 0, message: "No pending comments" });

    // Approve all
    await CommentModel.updateMany({ status: "pending" }, { $set: { status: "approved" } });

    // Update commentCount for each affected article (only top-level comments count)
    const topLevel = pending.filter((c: any) => !c.parentId);
    const articleCounts: Record<string, number> = {};
    topLevel.forEach((c: any) => {
      const aid = c.articleId.toString();
      articleCounts[aid] = (articleCounts[aid] || 0) + 1;
    });

    await Promise.all(
      Object.entries(articleCounts).map(([aid, count]) =>
        ArticleModel.updateOne({ _id: aid }, { $inc: { commentCount: count } })
      )
    );

    logActivity({ action: "comment.bulk_approved", entityType: "comment", details: `${pending.length} comments approved` });
    return NextResponse.json({ success: true, count: pending.length, message: `${pending.length} comments approved` });
  }

  if (action === "delete-spam") {
    const spam = await CommentModel.find({ status: "spam" }).select("_id").lean();

    if (spam.length === 0)
      return NextResponse.json({ success: true, count: 0, message: "No spam comments" });

    await CommentModel.deleteMany({ status: "spam" });

    logActivity({ action: "comment.bulk_deleted", entityType: "comment", details: `${spam.length} spam comments deleted` });
    return NextResponse.json({ success: true, count: spam.length, message: `${spam.length} spam comments deleted` });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
