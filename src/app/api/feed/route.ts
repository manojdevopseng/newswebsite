import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

export const revalidate = 1800; // 30 min

function escapeXml(str: string): string {
  return str
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&apos;");
}

export async function GET() {
  const base = siteConfig.url;
  const now  = new Date().toUTCString();

  let items = "";

  try {
    const { default: dbConnect }    = await import("@/lib/db/mongoose");
    const { default: ArticleModel } = await import("@/lib/db/models/Article");
    await import("@/lib/db/models/Category");
    await import("@/lib/db/models/Author");
    await dbConnect();

    const articles = await ArticleModel.find({ status: "published" })
      .populate("category", "name slug")
      .populate("author",   "name")
      .select("title slug excerpt featuredImage category author tags publishedAt updatedAt")
      .sort({ publishedAt: -1 })
      .limit(20)
      .lean()
      .exec();

    items = (articles as any[]).map((a) => {
      const cat     = a.category as { name: string; slug: string };
      const author  = a.author   as { name: string } | null;
      const url     = `${base}/${cat.slug}/${a.slug}`;
      const pubDate = new Date(a.publishedAt || a.updatedAt).toUTCString();
      const excerpt = escapeXml((a.excerpt || "").slice(0, 300));
      const title   = escapeXml(a.title || "");
      const image   = a.featuredImage ? `<enclosure url="${escapeXml(a.featuredImage)}" type="image/webp" length="0"/>` : "";
      const tags    = (a.tags || []).map((t: string) => `<category>${escapeXml(t)}</category>`).join("");

      return `
    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${excerpt}</description>
      ${author ? `<author>noreply@techpulseglobe.com (${escapeXml(author.name)})</author>` : ""}
      <category>${escapeXml(cat.name)}</category>
      ${tags}
      ${image}
    </item>`;
    }).join("");
  } catch {
    // DB unavailable — return empty but valid feed
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
>
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${base}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en-IN</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${base}/api/feed" rel="self" type="application/rss+xml"/>
    <image>
      <url>${base}/images/og-default.jpg</url>
      <title>${escapeXml(siteConfig.name)}</title>
      <link>${base}</link>
    </image>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type":  "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}

