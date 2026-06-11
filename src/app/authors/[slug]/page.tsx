import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Twitter, Linkedin, FileText, Eye, Clock } from "lucide-react";
import { siteConfig } from "@/config/site";
import { absoluteUrl, formatDate, formatNumber } from "@/lib/utils";
import { ArticleCard } from "@/components/article/ArticleCard";
import type { Author, ArticlePreview } from "@/types";

interface Params { slug: string }

async function getAuthor(slug: string): Promise<{ author: Author; articles: ArticlePreview[] } | null> {
  try {
    const { default: dbConnect }     = await import("@/lib/db/mongoose");
    const { default: AuthorModel }   = await import("@/lib/db/models/Author");
    const { default: ArticleModel }  = await import("@/lib/db/models/Article");
    await import("@/lib/db/models/Category");

    await dbConnect();

    const author = await AuthorModel.findOne({ slug }).lean() as any;
    if (!author) return null;

    const articles = await ArticleModel.find({ author: author._id, status: "published" })
      .populate("category", "name slug color")
      .select("title slug excerpt featuredImage category tags readingTime views publishedAt")
      .sort({ publishedAt: -1 })
      .limit(20)
      .lean() as any[];

    const serializedAuthor: Author = {
      _id:       author._id.toString(),
      name:      author.name,
      slug:      author.slug,
      bio:       author.bio,
      avatar:    author.avatar,
      twitter:   author.twitter,
      linkedin:  author.linkedin,
      expertise: author.expertise ?? [],
    };

    const serializedArticles: ArticlePreview[] = articles.map((a) => ({
      _id:          a._id.toString(),
      title:        a.title,
      slug:         a.slug,
      excerpt:      a.excerpt,
      featuredImage: a.featuredImage,
      category: {
        _id:   a.category._id.toString(),
        name:  a.category.name,
        slug:  a.category.slug,
        color: a.category.color,
      },
      author: {
        _id:    serializedAuthor._id,
        name:   serializedAuthor.name,
        slug:   serializedAuthor.slug,
        avatar: serializedAuthor.avatar,
      },
      tags:        a.tags ?? [],
      readingTime: a.readingTime ?? 3,
      views:       a.views ?? 0,
      publishedAt: a.publishedAt?.toISOString() ?? "",
    }));

    return { author: serializedAuthor, articles: serializedArticles };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getAuthor(slug);
  if (!data) return { title: "Author Not Found" };

  const { author } = data;
  const title = `${author.name} — Author at ${siteConfig.name}`;
  const description = author.bio || `Read articles by ${author.name} on ${siteConfig.name} — covering ${author.expertise.join(", ")}.`;
  const url = absoluteUrl(`/authors/${slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type:        "profile",
      url,
      title,
      description,
      siteName:    siteConfig.name,
      images:      author.avatar ? [{ url: author.avatar, width: 400, height: 400, alt: author.name }] : [],
    },
    twitter: {
      card:    "summary",
      title,
      description,
      creator: author.twitter ? `@${author.twitter.replace("@", "")}` : siteConfig.twitter,
    },
  };
}

export default async function AuthorPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const data = await getAuthor(slug);
  if (!data) notFound();

  const { author, articles } = data;

  const totalViews = articles.reduce((sum, a) => sum + (a.views ?? 0), 0);
  const totalReadTime = articles.reduce((sum, a) => sum + (a.readingTime ?? 0), 0);

  // JSON-LD Person schema
  const personSchema = {
    "@context": "https://schema.org",
    "@type":    "Person",
    name:       author.name,
    url:        absoluteUrl(`/authors/${author.slug}`),
    ...(author.avatar   && { image: author.avatar }),
    ...(author.bio      && { description: author.bio }),
    ...(author.twitter  && { sameAs: [`https://twitter.com/${author.twitter.replace("@", "")}`] }),
    worksFor: {
      "@type": "Organization",
      name:    siteConfig.name,
      url:     siteConfig.url,
    },
    knowsAbout: author.expertise,
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-fg mb-10">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <span className="text-foreground">Authors</span>
          <span>/</span>
          <span className="text-foreground">{author.name}</span>
        </nav>

        {/* Author Profile Card */}
        <div className="p-8 rounded-2xl bg-card border border-border mb-10">
          <div className="flex flex-col sm:flex-row items-start gap-6">

            {/* Avatar */}
            {author.avatar ? (
              <Image
                src={author.avatar}
                alt={author.name}
                width={96}
                height={96}
                className="rounded-full object-cover shrink-0 ring-2 ring-accent/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-3xl shrink-0 ring-2 ring-accent/20">
                {author.name[0]}
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">{author.name}</h1>

              {author.expertise.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {author.expertise.map((e) => (
                    <span
                      key={e}
                      className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              )}

              {author.bio && (
                <p className="mt-4 text-muted-fg leading-relaxed max-w-2xl">{author.bio}</p>
              )}

              {/* Social links */}
              <div className="flex gap-2 mt-4">
                {author.twitter && (
                  <a
                    href={`https://twitter.com/${author.twitter.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-fg hover:text-foreground text-xs font-medium transition-colors"
                  >
                    <Twitter size={12} /> {author.twitter}
                  </a>
                )}
                {author.linkedin && (
                  <a
                    href={author.linkedin.startsWith("http") ? author.linkedin : `https://${author.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-fg hover:text-foreground text-xs font-medium transition-colors"
                  >
                    <Linkedin size={12} /> LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-foreground">
                <FileText size={18} className="text-accent" />
                {articles.length}
              </div>
              <p className="text-xs text-muted-fg mt-1">Articles</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-foreground">
                <Eye size={18} className="text-accent" />
                {formatNumber(totalViews)}
              </div>
              <p className="text-xs text-muted-fg mt-1">Total Views</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-foreground">
                <Clock size={18} className="text-accent" />
                {totalReadTime}m
              </div>
              <p className="text-xs text-muted-fg mt-1">Total Read Time</p>
            </div>
          </div>
        </div>

        {/* Articles by this author */}
        <div>
          <h2 className="text-xl font-bold mb-6">
            Articles by {author.name}
            <span className="ml-2 text-sm font-normal text-muted-fg">({articles.length})</span>
          </h2>

          {articles.length === 0 ? (
            <div className="text-center py-16 text-muted-fg">
              <FileText size={32} className="mx-auto mb-3 opacity-30" />
              <p>No published articles yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.map((article, i) => (
                <ArticleCard
                  key={article._id}
                  article={article}
                  priority={i < 3}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
