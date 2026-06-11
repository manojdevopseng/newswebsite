import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import type { Metadata } from "next";
import { absoluteUrl, formatDate, processContentImages } from "@/lib/utils";
import { PublishDate } from "@/components/article/PublishDate";
import { newsArticleSchema, breadcrumbSchema } from "@/lib/seo/schema";
import { ReadingProgress } from "@/components/article/ReadingProgress";
import { AISummaryBox } from "@/components/article/AISummaryBox";
import { TableOfContents } from "@/components/article/TableOfContents";
import { ShareButtons } from "@/components/article/ShareButtons";
import { RelatedArticles } from "@/components/article/RelatedArticles";
import { AuthorCard } from "@/components/article/AuthorCard";
import { CommentsSection } from "@/components/article/CommentsSection";
import { ExploreTopics } from "@/components/article/ExploreTopics";
import { CategoryBadge } from "@/components/article/CategoryBadge";
import { ArticleAd } from "@/components/ads/ArticleAd";
import { SidebarAd } from "@/components/ads/SidebarAd";
import { getCategoryBySlug } from "@/config/categories";
import dbConnect from "@/lib/db/mongoose";
import ArticleModel from "@/lib/db/models/Article";
import "@/lib/db/models/Author";
import "@/lib/db/models/Category";
import type { Article, ArticlePreview } from "@/types";
import { siteConfig } from "@/config/site";
import { HtmlLangSetter } from "@/components/shared/HtmlLangSetter";

// Revalidate Hindi article pages every hour
export const revalidate = 3600;

interface Params { category: string; slug: string }

async function getArticle(slug: string): Promise<Article | null> {
  try {
    await dbConnect();
    const article = await ArticleModel.findOne({ slug, status: "published", publishedAt: { $lte: new Date() } })
      .populate("category", "name slug color description")
      .populate("author", "name slug avatar bio twitter linkedin expertise")
      .lean()
      .exec();
    if (!article) return null;
    const a = article as any;
    return {
      ...a,
      _id: a._id?.toString(),
      category: a.category ? { ...a.category, _id: a.category._id?.toString() } : null,
      author:   a.author   ? { ...a.author,   _id: a.author._id?.toString()   } : null,
    } as Article;
  } catch { return null; }
}

async function getRelated(categorySlug: string, excludeSlug: string, tags: string[] = []): Promise<ArticlePreview[]> {
  try {
    await dbConnect();
    const CategoryModel = (await import("@/lib/db/models/Category")).default;
    const toPreview = (a: any): ArticlePreview => ({
      ...a,
      _id: a._id?.toString(),
      category: a.category ? { ...a.category, _id: a.category._id?.toString() } : null,
    });
    const category = await CategoryModel.findOne({ slug: categorySlug }).lean();
    const sameCat = category
      ? await ArticleModel.find({ category: (category as any)._id, slug: { $ne: excludeSlug }, status: "published" })
          .populate("category", "name slug color")
          .sort({ publishedAt: -1 })
          .limit(3)
          .lean()
          .exec()
      : [];
    if (sameCat.length >= 3) return sameCat.map(toPreview);
    const seenSlugs = new Set([excludeSlug, ...sameCat.map((a: any) => a.slug)]);
    let tagMatches: any[] = [];
    if (tags.length > 0 && sameCat.length < 3) {
      tagMatches = await ArticleModel.find({ slug: { $nin: [...seenSlugs] }, status: "published", tags: { $in: tags } })
        .populate("category", "name slug color").sort({ publishedAt: -1 }).limit(3 - sameCat.length).lean().exec();
      tagMatches.forEach((a: any) => seenSlugs.add(a.slug));
    }
    const combined = [...sameCat, ...tagMatches];
    if (combined.length >= 3) return combined.map(toPreview);
    const recent = await ArticleModel.find({ slug: { $nin: [...seenSlugs] }, status: "published" })
      .populate("category", "name slug color").sort({ publishedAt: -1 }).limit(3 - combined.length).lean().exec();
    return [...combined, ...recent].map(toPreview);
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug, category: categorySlug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article Not Found" };

  const cat = article.category as { _id: string; name: string; slug: string; color: string };

  // If accessed via wrong category URL, return noindex
  if (cat.slug !== categorySlug) {
    return {
      title: article.title_hi || article.title,
      robots: { index: false, follow: false },
    };
  }

  // No Hindi content at all — noindex (page component will redirect to English)
  const hasHindiContent = !!(article.title_hi || article.contentHtml_hi);
  if (!hasHindiContent) {
    return {
      title: article.title,
      robots: { index: false, follow: false },
      alternates: { canonical: absoluteUrl(`/${categorySlug}/${slug}`) },
    };
  }

  const enUrl = absoluteUrl(`/${categorySlug}/${slug}`);
  const hiUrl = absoluteUrl(`/hi/${categorySlug}/${slug}`);

  // Use Hindi SEO fields if available, fall back to English
  const metaTitle = `${article.title_hi || article.title} | ${siteConfig.name}`;
  const metaDesc  = article.excerpt_hi || article.seo?.metaDescription || article.excerpt;

  return {
    title: metaTitle,
    description: metaDesc,
    alternates: {
      canonical: hiUrl,
      languages: { en: enUrl, hi: hiUrl, "x-default": enUrl },
    },
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      type: "article",
      url: hiUrl,
      images: article.seo?.ogImage || article.featuredImage
        ? [{ url: (article.seo?.ogImage || article.featuredImage)! }]
        : [],
      locale: "hi_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDesc,
    },
  };
}

export default async function HindiArticlePage({ params }: { params: Promise<Params> }) {
  const { slug, category: categorySlug } = await params;

  const category = getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const article = await getArticle(slug);
  if (!article) notFound();

  const cat    = article.category as { _id: string; name: string; slug: string; color: string };

  // Redirect to correct category if URL doesn't match article's actual category
  if (cat.slug !== categorySlug) {
    redirect(`/hi/${cat.slug}/${slug}`);
  }

  const related = await getRelated(categorySlug, slug, article.tags ?? []);
  const author = article.author   as { _id: string; name: string; slug: string; bio: string; avatar: string; twitter: string; linkedin: string; expertise: string[] };

  const enUrl  = absoluteUrl(`/${categorySlug}/${slug}`);
  const hiUrl  = absoluteUrl(`/hi/${categorySlug}/${slug}`);

  // Resolved display values: use Hindi if available, fall back to English
  const displayTitle   = article.title_hi       || article.title;
  const displayExcerpt = article.excerpt_hi      || article.excerpt;
  const displayContent = article.contentHtml_hi  || article.contentHtml
    || (typeof article.content === "string" ? article.content : "");

  // If no Hindi content exists, redirect to English version to avoid duplicate content in GSC
  const hasHindiContent = !!(article.title_hi && article.contentHtml_hi);
  if (!hasHindiContent) {
    redirect(`/${cat.slug}/${slug}`);
  }

  const articleSchema = newsArticleSchema({
    ...article,
    title: displayTitle,
    excerpt: displayExcerpt,
    category: cat,
    author: { name: author.name, slug: author.slug },
  } as Parameters<typeof newsArticleSchema>[0]);

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: siteConfig.url },
    { name: cat.name, url: absoluteUrl(`/${cat.slug}`) },
    { name: displayTitle, url: hiUrl },
  ]);

  return (
    <>
      <ReadingProgress />

      {/* Set <html lang="hi"> for this page */}
      <HtmlLangSetter lang="hi" />

      <Script id="article-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:pl-24 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-fg mb-6">
          <a href="/" className="hover:text-foreground transition-colors">Home</a>
          <span>/</span>
          <a href={`/${cat.slug}`} className="hover:text-foreground transition-colors">{cat.name}</a>
          <span>/</span>
          <span className="text-foreground truncate max-w-xs">{displayTitle}</span>
        </nav>

        <div className="grid xl:grid-cols-[1fr_300px] gap-10 items-start">
          {/* Main content column */}
          <div className="min-w-0">
            <header className="mb-8">
              <CategoryBadge slug={cat.slug} name={cat.name} />

              {/* Hindi content badge */}
              {hasHindiContent && (
                <span className="inline-flex items-center gap-1 mt-3 mb-1 px-2 py-0.5 rounded-full text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  हिन्दी
                </span>
              )}

              <h1 className="mt-2 text-3xl sm:text-4xl font-bold leading-tight tracking-tight" lang={hasHindiContent ? "hi" : "en"}>
                {displayTitle}
              </h1>
              <p className="mt-4 text-lg text-muted-fg leading-relaxed" lang={hasHindiContent ? "hi" : "en"}>
                {displayExcerpt}
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-5 text-sm text-muted-fg">
                <div className="flex items-center gap-2">
                  {author.avatar ? (
                    <Image src={author.avatar} alt={author.name} width={28} height={28} className="rounded-full" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">{author.name[0]}</div>
                  )}
                  <span className="font-medium text-foreground">{author.name}</span>
                </div>
                <span>·</span>
                <PublishDate date={article.publishedAt} />
                <span>·</span>
                <span>{article.readingTime} मिनट पढ़ें</span>
              </div>
            </header>

            {/* Hero image */}
            {article.featuredImage && (
              <figure className="relative aspect-video rounded-2xl overflow-hidden bg-muted mb-8">
                <Image
                  src={article.featuredImage}
                  alt={displayTitle}
                  title={displayTitle}
                  fill
                  priority
                  quality={75}
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 860px"
                />
              </figure>
            )}

            <div className="relative">
              <div className="xl:absolute xl:-left-16 xl:top-0 flex xl:flex-col gap-2 mb-6 xl:mb-0 xl:w-10">
                <ShareButtons title={displayTitle} url={hiUrl} />
              </div>

              {article.aiSummary && <AISummaryBox summary={article.aiSummary} />}

              <div
                className="article-content prose dark:prose-invert prose-lg max-w-none
                  prose-headings:font-bold prose-headings:tracking-tight
                  prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-xl prose-img:shadow-md
                  prose-code:text-accent prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                  prose-pre:bg-muted prose-pre:border prose-pre:border-border"
                lang={hasHindiContent ? "hi" : "en"}
                dangerouslySetInnerHTML={{
                  __html: processContentImages(displayContent, displayTitle),
                }}
              />

              <ArticleAd />
            </div>

            {/* Financial disclaimer */}
            {["finance", "investing", "crypto"].includes(categorySlug) && (
              <div className="mt-8 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-200/70 leading-relaxed">
                <strong className="text-amber-300 font-semibold">Disclaimer:</strong> This article is for informational and educational purposes only. Nothing here constitutes financial, investment, or tax advice. Always consult a SEBI-registered advisor before making investment decisions.{" "}
                <a href="/disclaimer" className="underline hover:text-amber-200 transition-colors">Read full disclaimer →</a>
              </div>
            )}

            <ExploreTopics tags={article.tags ?? []} categorySlug={cat.slug} categoryName={cat.name} />
            <AuthorCard author={author as Parameters<typeof AuthorCard>[0]["author"]} />
            <CommentsSection articleId={article._id} />
            <RelatedArticles articles={related} />
          </div>

          {/* Sidebar */}
          <aside className="hidden xl:flex flex-col gap-6 sticky top-24 self-start">
            <TableOfContents />
            <SidebarAd slot="article-sidebar" />
          </aside>
        </div>
      </article>
    </>
  );
}
