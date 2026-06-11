import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { categories } from "@/config/categories";
import { GLOSSARY } from "@/config/glossary";
import { getAllCompareSlugs } from "@/config/compare";

// Revalidate every 5 minutes as fallback — publish triggers on-demand revalidation via revalidatePath
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,                       lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${base}/ai-tools`,         lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${base}/compare`,          lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    // /search is noindex — excluded from sitemap intentionally
    { url: `${base}/newsletter`,       lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/glossary`,         lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    // Legal & company pages — required for Google AdSense approval
    { url: `${base}/about`,            lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`,          lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/privacy`,          lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/terms`,            lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/disclaimer`,       lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];

  // Compare routes (static — from config)
  const compareRoutes: MetadataRoute.Sitemap = getAllCompareSlugs().map((slug) => ({
    url:             `${base}/compare/${slug}`,
    lastModified:    now,
    changeFrequency: "monthly" as const,
    priority:        0.65,
  }));

  // Glossary term routes (static — from config)
  const glossaryRoutes: MetadataRoute.Sitemap = Object.keys(GLOSSARY).map((term) => ({
    url:             `${base}/glossary/${term}`,
    lastModified:    now,
    changeFrequency: "monthly" as const,
    priority:        0.6,
  }));

  // Category routes
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${base}/${cat.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Article + Author routes — fetched at runtime from MongoDB if available
  let articleRoutes: MetadataRoute.Sitemap = [];
  let authorRoutes:  MetadataRoute.Sitemap = [];

  try {
    const { default: dbConnect }    = await import("@/lib/db/mongoose");
    const { default: ArticleModel } = await import("@/lib/db/models/Article");
    const { default: AuthorModel }  = await import("@/lib/db/models/Author");
    await import("@/lib/db/models/Category");
    await dbConnect();

    const [articles, authors] = await Promise.all([
      ArticleModel.find({ status: "published" })
        .populate("category", "slug")
        .select("slug category updatedAt publishedAt featuredImage title title_hi contentHtml_hi")
        .lean()
        .exec(),
      AuthorModel.find({})
        .select("slug updatedAt")
        .lean()
        .exec(),
    ]);

    articleRoutes = articles
      .filter((a) => {
        const cat = a.category as unknown as { slug?: string } | null;
        return cat?.slug && a.slug;
      })
      .flatMap((a) => {
        const cat      = a.category as unknown as { slug: string };
        const lastMod  = new Date((a.updatedAt as Date) || (a.publishedAt as Date));
        // Only include Hindi URL if BOTH title and content are in Hindi
        const hasHindi = !!(a as any).title_hi && !!(a as any).contentHtml_hi;

        // English article entry
        const enEntry: MetadataRoute.Sitemap[number] = {
          url:             `${base}/${cat.slug}/${a.slug}`,
          lastModified:    lastMod,
          changeFrequency: "weekly" as const,
          priority:        0.7,
        };
        if ((a as any).featuredImage) {
          (enEntry as any).images = [(a as any).featuredImage];
        }

        // Hindi article entry — only if Hindi content exists
        if (!hasHindi) return [enEntry];

        const hiEntry: MetadataRoute.Sitemap[number] = {
          url:             `${base}/hi/${cat.slug}/${a.slug}`,
          lastModified:    lastMod,
          changeFrequency: "weekly" as const,
          priority:        0.65,
        };
        if ((a as any).featuredImage) {
          (hiEntry as any).images = [(a as any).featuredImage];
        }

        return [enEntry, hiEntry];
      });

    authorRoutes = (authors as any[]).map((a) => ({
      url:             `${base}/authors/${a.slug}`,
      lastModified:    new Date(a.updatedAt || now),
      changeFrequency: "weekly" as const,
      priority:        0.6,
    }));
  } catch {
    // DB not available at build time — skip dynamic routes
  }

  return [...staticRoutes, ...compareRoutes, ...glossaryRoutes, ...categoryRoutes, ...articleRoutes, ...authorRoutes];
}
