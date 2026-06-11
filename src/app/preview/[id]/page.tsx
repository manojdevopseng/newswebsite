/**
 * /preview/[id] — Admin-only article preview page
 * Shows any article (draft or published) exactly as it would appear on the frontend.
 * Protected: redirects to /admin/login if no session.
 */
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/admin/auth";
import dbConnect from "@/lib/db/mongoose";
import ArticleModel from "@/lib/db/models/Article";
import "@/lib/db/models/Author";
import "@/lib/db/models/Category";
import { formatDate } from "@/lib/utils";
import { AISummaryBox } from "@/components/article/AISummaryBox";
import { CategoryBadge } from "@/components/article/CategoryBadge";
import { AuthorCard } from "@/components/article/AuthorCard";
import { ReadingProgress } from "@/components/article/ReadingProgress";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

interface Params { id: string }

async function getArticleById(id: string) {
  try {
    await dbConnect();
    const article = await ArticleModel.findById(id)
      .populate("category", "name slug color description")
      .populate("author", "name slug avatar bio twitter linkedin expertise")
      .lean()
      .exec();
    if (!article) return null;
    const a = article as any;
    return {
      ...a,
      _id:      a._id?.toString(),
      category: a.category ? { ...a.category, _id: a.category._id?.toString() } : null,
      author:   a.author   ? { ...a.author,   _id: a.author._id?.toString()   } : null,
    };
  } catch { return null; }
}

export default async function PreviewPage({ params }: { params: Promise<Params> }) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) notFound();

  const cat    = article.category as { _id: string; name: string; slug: string; color: string } | null;
  const author = article.author   as { _id: string; name: string; slug: string; bio: string; avatar: string; twitter: string; linkedin: string; expertise: string[] } | null;

  return (
    <>
      <ReadingProgress />

      {/* ── Preview Banner ─────────────────────────────────────── */}
      {/* top-16 = 64px to sit below the fixed site header (which is ~60px tall) */}
      <div className="sticky top-16 z-40 w-full bg-amber-500 text-amber-950 text-sm font-semibold px-4 py-2.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-amber-900/20 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
            👁 Preview Mode
          </span>
          <span className="text-amber-900">
            This article is{" "}
            <strong className="capitalize">{article.status}</strong>
            {article.status !== "published" && " — not visible to public yet"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/articles/${id}`}
            className="text-xs bg-amber-900/20 hover:bg-amber-900/30 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            ← Back to Editor
          </Link>
          {article.status === "published" && cat && (
            <Link
              href={`/${cat.slug}/${article.slug}`}
              target="_blank"
              className="text-xs bg-amber-900 text-amber-50 hover:bg-amber-800 px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              View Live ↗
            </Link>
          )}
        </div>
      </div>

      {/* ── Article Content ─────────────────────────────────────── */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        {cat && (
          <nav className="flex items-center gap-2 text-xs text-muted-fg mb-6">
            <span className="text-foreground/50">Home</span>
            <span>/</span>
            <span className="text-foreground/50">{cat.name}</span>
            <span>/</span>
            <span className="text-foreground truncate max-w-xs">{article.title}</span>
          </nav>
        )}

        {/* Article header */}
        <header className="mb-8">
          {cat && <CategoryBadge slug={cat.slug} name={cat.name} />}
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="mt-4 text-lg text-muted-fg leading-relaxed">{article.excerpt}</p>
          )}

          {author && (
            <div className="flex flex-wrap items-center gap-4 mt-5 text-sm text-muted-fg">
              <div className="flex items-center gap-2">
                {author.avatar ? (
                  <Image src={author.avatar} alt={author.name} width={28} height={28} className="rounded-full" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">
                    {author.name[0]}
                  </div>
                )}
                <span className="font-medium text-foreground">{author.name}</span>
              </div>
              {article.publishedAt && (
                <>
                  <span>·</span>
                  <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                </>
              )}
              {article.readingTime && (
                <>
                  <span>·</span>
                  <span>{article.readingTime} min read</span>
                </>
              )}
            </div>
          )}
        </header>

        {/* Hero image */}
        {article.featuredImage && (
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted mb-8">
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        )}

        {/* AI Summary */}
        {article.aiSummary && <AISummaryBox summary={article.aiSummary} />}

        {/* Article body */}
        <div
          className="article-content prose dark:prose-invert prose-lg max-w-none
            prose-headings:font-bold prose-headings:tracking-tight
            prose-a:text-accent prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl prose-img:shadow-md
            prose-code:text-accent prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-muted prose-pre:border prose-pre:border-border"
          dangerouslySetInnerHTML={{
            __html:
              article.contentHtml ||
              (typeof article.content === "string" ? article.content : ""),
          }}
        />

        {/* Tags */}
        {(article.tags?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-border">
            {(article.tags as string[]).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 text-xs rounded-full bg-muted text-muted-fg"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Author card */}
        {author && (
          <AuthorCard author={author as Parameters<typeof AuthorCard>[0]["author"]} />
        )}

        {/* Bottom actions */}
        <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
          <Link
            href={`/admin/articles/${id}`}
            className="text-sm text-muted-fg hover:text-foreground transition-colors"
          >
            ← Back to Editor
          </Link>
          {article.status !== "published" && (
            <p className="text-xs text-muted-fg bg-muted px-3 py-1.5 rounded-lg">
              Draft — not visible to readers yet
            </p>
          )}
        </div>
      </article>
    </>
  );
}
