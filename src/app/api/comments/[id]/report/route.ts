import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import CommentModel from "@/lib/db/models/Comment";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await dbConnect();

  const comment = await CommentModel.findOneAndUpdate(
    { _id: id, status: "approved" },
    { $inc: { reportCount: 1 }, $set: { reported: true } },
    { new: true, select: "reportCount" }
  ).lean();

  if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

  return NextResponse.json({ success: true, reportCount: (comment as any).reportCount });
}
