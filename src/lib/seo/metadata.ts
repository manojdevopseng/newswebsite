import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/utils";
import type { ArticlePreview, ArticleSEO } from "@/types";

export function generateRootMetadata(): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${siteConfig.name} — ${siteConfig.tagline}`,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: [...siteConfig.keywords],
    authors: [...siteConfig.authors],
    creator: siteConfig.creator,
    publisher: siteConfig.publisher,
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: siteConfig.url,
      title: `${siteConfig.name} — ${siteConfig.tagline}`,
      description: siteConfig.description,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteConfig.name} — ${siteConfig.tagline}`,
      description: siteConfig.description,
      images: [siteConfig.ogImage],
      creator: siteConfig.twitter,
      site: siteConfig.twitter,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
    other: {
      ...(process.env.NEXT_PUBLIC_ADSENSE_CLIENT
        ? { "google-adsense-account": process.env.NEXT_PUBLIC_ADSENSE_CLIENT }
        : {}),
    },
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png" }],
      other: [{ rel: "manifest", url: "/site.webmanifest" }],
    },
    alternates: {
      canonical: siteConfig.url,
      types: {
        "application/rss+xml": [
          { url: `${siteConfig.url}/api/feed`, title: `${siteConfig.name} RSS Feed` },
        ],
      },
    },
  };
}

export function generateArticleMetadata(
  article: ArticlePreview & { category: { slug: string; name: string }; seo?: ArticleSEO & { hreflangAlternates?: Record<string, string> } }
): Metadata {
  const url = absoluteUrl(`/${article.category.slug}/${article.slug}`);
  const title       = article.seo?.metaTitle       || article.title;
  const description = article.seo?.metaDescription || article.excerpt;
  const image       = article.seo?.ogImage || article.featuredImage || siteConfig.ogImage;
  const canonical   = article.seo?.canonicalUrl    || url;

  // hreflang alternates (e.g. { en: '...', hi: '...' })
  const languages = article.seo?.hreflangAlternates ?? undefined;

  return {
    title,
    description,
    keywords: article.tags,
    alternates: { canonical, ...(languages ? { languages } : {}) },
    robots: {
      index:  !article.seo?.noIndex,
      follow: true,
      googleBot: {
        index:  !article.seo?.noIndex,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      authors: [absoluteUrl(`/authors/${article.author.slug}`)],
      publishedTime: article.publishedAt,
      modifiedTime: (article as any).updatedAt || article.publishedAt,
      section: article.category.name,
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: siteConfig.twitter,
      site: siteConfig.twitter,
    },
  };
}

export function generateCategoryMetadata(category: { name: string; slug: string; description?: string; metaTitle?: string; metaDescription?: string }): Metadata {
  const title = category.metaTitle || `${category.name} News & Analysis`;
  const description = category.metaDescription || category.description || `Latest ${category.name} news, analysis, and insights on ${siteConfig.name}.`;
  const url = absoluteUrl(`/${category.slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: siteConfig.name,
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [siteConfig.ogImage],
    },
  };
}
