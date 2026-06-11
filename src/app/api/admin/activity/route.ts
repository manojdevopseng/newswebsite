export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/admin/auth";
import dbConnect from "@/lib/db/mongoose";
import ActivityLogModel from "@/lib/db/models/ActivityLog";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entityType = req.nextUrl.searchParams.get("entityType") || "";
  const page       = parseInt(req.nextUrl.searchParams.get("page") || "1");
  const limit      = 30;

  await dbConnect();

  const filter = entityType ? { entityType } : {};

  const [logs, total] = await Promise.all([
    ActivityLogModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ActivityLogModel.countDocuments(filter),
  ]);

  return NextResponse.json({
    logs: logs.map((l: any) => ({
      _id:         l._id.toString(),
      action:      l.action,
      entityType:  l.entityType,
      entityId:    l.entityId,
      entityTitle: l.entityTitle,
      details:     l.details,
      createdAt:   l.createdAt,
    })),
    total,
    page,
    hasMore: page * limit < total,
  });
}
