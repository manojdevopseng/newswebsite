import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/utils";
import type { Article, AITool } from "@/types";

export function newsArticleSchema(article: Article & { category: { name: string; slug: string }; author: { name: string; slug: string } }) {
  const articleUrl = absoluteUrl(`/${article.category.slug}/${article.slug}`);
  const imageUrl   = article.featuredImage || siteConfig.ogImage;

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: [
      {
        "@type": "ImageObject",
        url: imageUrl,
        width: 1200,
        height: 630,
        caption: article.title,
      },
    ],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Person",
      name: article.author.name,
      url: absoluteUrl(`/authors/${article.author.slug}`),
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.publisher,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/logo-square-1000.png"),
        width: 1000,
        height: 1000,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    articleSection: article.category.name,
    keywords: article.tags.join(", "),
    url: articleUrl,
    thumbnailUrl: imageUrl,
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/logo-square-1000.png"),
      width: 1000,
      height: 1000,
    },
    sameAs: [`https://twitter.com/${siteConfig.twitter.replace("@", "")}`],
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function aiToolSchema(tool: AITool) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    url: tool.website,
    applicationCategory: "AIApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: tool.pricing === "free" ? "0" : undefined,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating:
      tool.rating > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: tool.rating,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  };
}

export function faqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
