import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import ArticleModel from "@/lib/db/models/Article";
import "@/lib/db/models/Category"; // register Category schema for populate()
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();

    const since = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const articles = await ArticleModel.find({
      status: "published",
      publishedAt: { $gte: since },
    })
      .populate("category", "slug name")
      .select("title slug category tags publishedAt title_hi contentHtml_hi")
      .sort({ publishedAt: -1 })
      .limit(1000)
      .lean()
      .exec();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
>
${articles
  .filter((a) => {
    const cat = a.category as unknown as { slug?: string } | null;
    return cat?.slug && a.slug;
  })
  .flatMap((a) => {
    const cat     = a.category as unknown as { slug: string; name: string };
    const tags    = Array.isArray(a.tags) ? (a.tags as string[]).join(", ") : "";
    const pubDate = new Date(a.publishedAt as Date).toISOString();
    const hasHindi = !!(a as any).title_hi && !!(a as any).contentHtml_hi;

    const enEntry = `  <url>
    <loc>${siteConfig.url}/${cat.slug}/${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(siteConfig.name)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(a.title as string)}</news:title>
    </news:news>
  </url>`;

    if (!hasHindi) return [enEntry];

    const hiTitle = (a as any).title_hi as string
    const hiEntry = `  <url>
    <loc>${siteConfig.url}/hi/${cat.slug}/${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(siteConfig.name)}</news:name>
        <news:language>hi</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(hiTitle || (a.title as string))}</news:title>
    </news:news>
  </url>`;

    return [enEntry, hiEntry];
  })
  .join("\n")}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        // 5 min cache — publish triggers immediate revalidatePath('/sitemap.xml')
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch {
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
