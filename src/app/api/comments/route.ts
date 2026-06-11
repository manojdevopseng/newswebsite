export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import dbConnect from "@/lib/db/mongoose";
import CommentModel from "@/lib/db/models/Comment";
import ArticleModel from "@/lib/db/models/Article";
import { isRateLimited, getIP } from "@/lib/rate-limit";
import { cacheGet, cacheSet } from "@/lib/cache";

// ─── Spam keyword filter ──────────────────────────────────────────────────────
const SPAM_KEYWORDS = [
  "casino", "gambling", "poker", "betting", "bet now",
  "viagra", "cialis", "pharmacy", "cheap pills",
  "payday loan", "quick loan", "credit score fix",
  "make money fast", "earn money online", "work from home job",
  "bitcoin investment", "crypto doubler", "forex signal",
  "click here", "buy now", "free offer", "limited offer",
  "whatsapp me", "call me at",
  "seo service", "buy backlink", "guest post",
  "xxx", "adult content",
];

function isSpam(content: string): boolean {
  const lower = content.toLowerCase();
  return SPAM_KEYWORDS.some(kw => lower.includes(kw));
}

// ─── Gravatar hash ────────────────────────────────────────────────────────────
function gravatarHash(email: string): string {
  return createHash("md5").update(email.trim().toLowerCase()).digest("hex");
}

// ─── GET /api/comments?articleId=xxx&sort=newest|oldest ──────────────────────
export async function GET(req: NextRequest) {
  const articleId  = req.nextUrl.searchParams.get("articleId");
  const sortParam  = req.nextUrl.searchParams.get("sort") === "oldest" ? "oldest" : "newest";
  const sort       = sortParam === "oldest" ? 1 : -1;
  if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 });

  const cacheKey = `comments:${articleId}:${sortParam}`
  const cached   = await cacheGet<{ comments: unknown[] }>(cacheKey)
  if (cached) return NextResponse.json(cached)

  await dbConnect();

  const comments = await CommentModel.find({
    articleId,
    status:   "approved",
    parentId: null,
  })
    .sort({ pinned: -1, createdAt: sort }) // pinned always first
    .select("name gravatarHash content createdAt parentId likes pinned")
    .lean();

  const ids = comments.map((c: any) => c._id);
  const replies = ids.length > 0
    ? await CommentModel.find({
        articleId,
        status:   "approved",
        parentId: { $in: ids },
      })
        .sort({ createdAt: 1 })
        .select("name gravatarHash content createdAt parentId likes")
        .lean()
    : [];

  const result = {
    comments: comments.map((c: any) => ({
      _id:          c._id.toString(),
      name:         c.name,
      gravatarHash: c.gravatarHash,
      content:      c.content,
      createdAt:    c.createdAt,
      likes:        c.likes || 0,
      pinned:       c.pinned || false,
      replies: replies
        .filter((r: any) => r.parentId?.toString() === c._id.toString())
        .map((r: any) => ({
          _id:          r._id.toString(),
          name:         r.name,
          gravatarHash: r.gravatarHash,
          content:      r.content,
          createdAt:    r.createdAt,
          likes:        r.likes || 0,
        })),
    })),
  }
  await cacheSet(cacheKey, result, 120)
  return NextResponse.json(result)
}

// ─── POST /api/comments ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { articleId, parentId, name, email, content, honeypot } = body;

    // Honeypot — bots fill hidden field, humans don't
    if (honeypot) return NextResponse.json({ success: true });

    // Validation
    if (!articleId || !name?.trim() || !email?.trim() || !content?.trim())
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    if (content.trim().length < 10)
      return NextResponse.json({ error: "Comment must be at least 10 characters" }, { status: 400 });
    if (content.trim().length > 1000)
      return NextResponse.json({ error: "Comment must be under 1000 characters" }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    if (name.trim().length > 60)
      return NextResponse.json({ error: "Name too long" }, { status: 400 });

    // Rate limiting — 3 comments per hour per IP
    const ip = getIP(req)
    if (await isRateLimited(`comment:${ip}`, 3, 60 * 60 * 1000))
      return NextResponse.json({ error: "Too many comments. Please wait before posting again." }, { status: 429 });

    await dbConnect();

    // Verify article
    const article = await ArticleModel.findOne({ _id: articleId, status: "published" }).lean();
    if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });

    // Verify parent comment (if reply)
    if (parentId) {
      const parent = await CommentModel.findOne({ _id: parentId, articleId, status: "approved" }).lean();
      if (!parent) return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
    }

    // Auto-spam detection
    const autoSpam = isSpam(content.trim());

    await CommentModel.create({
      articleId,
      parentId:     parentId || null,
      name:         name.trim(),
      email:        email.trim().toLowerCase(),
      gravatarHash: gravatarHash(email),
      content:      content.trim(),
      status:       autoSpam ? "spam" : "pending",
      ip,
    });

    return NextResponse.json({
      success: true,
      message: "Your comment has been submitted and is awaiting moderation.",
    });
  } catch (err) {
    console.error("POST /api/comments error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
