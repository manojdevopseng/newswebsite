import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/admin/auth";
import dbConnect from "@/lib/db/mongoose";
import ArticleModel from "@/lib/db/models/Article";
import { logActivity } from "@/lib/admin/activity";
import { isRateLimited, getIP } from "@/lib/rate-limit";

// POST /api/admin/articles/bulk  { action, ids }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: 10 bulk operations per hour per IP
  const ip = getIP(req)
  if (await isRateLimited(`admin:bulk:${ip}`, 10, 60 * 60 * 1000))
    return NextResponse.json({ error: 'Too many bulk operations' }, { status: 429 })

  const { action, ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0)
    return NextResponse.json({ error: "ids required" }, { status: 400 });

  await dbConnect();

  if (action === "delete") {
    await ArticleModel.deleteMany({ _id: { $in: ids } });
    revalidatePath("/", "layout");
    logActivity({ action: "article.bulk_deleted", entityType: "article", details: `${ids.length} articles deleted` });
    return NextResponse.json({ success: true, count: ids.length });
  }

  const statusMap: Record<string, string> = {
    publish: "published",
    draft:   "draft",
    archive: "archived",
  };

  if (!statusMap[action])
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  const newStatus = statusMap[action];
  const update: any = { $set: { status: newStatus } };
  if (newStatus === "published") update.$set.publishedAt = new Date();

  await ArticleModel.updateMany({ _id: { $in: ids } }, update);
  revalidatePath("/", "layout");
  logActivity({ action: `article.bulk_${action}`, entityType: "article", details: `${ids.length} articles → ${newStatus}` });

  return NextResponse.json({ success: true, count: ids.length });
}
