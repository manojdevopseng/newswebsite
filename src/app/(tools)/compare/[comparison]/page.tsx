import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import { ArrowLeft, ExternalLink, CheckCircle2 } from "lucide-react";
import { faqSchema } from "@/lib/seo/schema";
import { siteConfig } from "@/config/site";
import { COMPARE_PAIRS, getAllCompareSlugs } from "@/config/compare";

interface Params { comparison: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { comparison } = await params;
  const pair = COMPARE_PAIRS[comparison];
  if (!pair) return { title: "Comparison Not Found" };

  const title       = `${pair.tool1.name} vs ${pair.tool2.name} — Which is Better in 2025?`;
  const description = pair.summary.slice(0, 160);
  const url         = `${siteConfig.url}/compare/${comparison}`;

  return {
    title,
    description,
    keywords:   pair.tags,
    alternates: { canonical: url },
    openGraph:  { title, description, url, siteName: siteConfig.name, type: "article", images: [{ url: `${siteConfig.url}${siteConfig.ogImage}`, width: 1200, height: 630, alt: title }] },
    twitter:    { card: "summary_large_image", title, description, images: [`${siteConfig.url}${siteConfig.ogImage}`] },
  };
}

export function generateStaticParams() {
  return getAllCompareSlugs().map((comparison) => ({ comparison }));
}

export default async function ComparisonPage({ params }: { params: Promise<Params> }) {
  const { comparison } = await params;
  const pair = COMPARE_PAIRS[comparison];
  if (!pair) notFound();

  const { tool1, tool2, summary, tags } = pair;

  const faqs = [
    {
      question: `Is ${tool1.name} better than ${tool2.name}?`,
      answer:   `It depends on your use case. ${summary}`,
    },
    {
      question: `What is the main difference between ${tool1.name} and ${tool2.name}?`,
      answer:   `${tool1.name}: ${tool1.description} ${tool2.name}: ${tool2.description}`,
    },
    {
      question: `Can I use both ${tool1.name} and ${tool2.name}?`,
      answer:   `Yes. Many professionals use both tools for different tasks. ${tool1.name} and ${tool2.name} solve overlapping but distinct problems, and combining them can maximize productivity.`,
    },
    {
      question: `Which AI tool should a beginner choose: ${tool1.name} or ${tool2.name}?`,
      answer:   `Both ${tool1.name} and ${tool2.name} are beginner-friendly. We recommend trying the free tier of each to discover which fits your workflow better.`,
    },
  ];

  // JSON-LD
  const faqJsonLd   = faqSchema(faqs);
  const articleJsonLd = {
    "@context":    "https://schema.org",
    "@type":       "Article",
    headline:      `${tool1.name} vs ${tool2.name} — Which is Better in 2025?`,
    description:   summary,
    url:           `${siteConfig.url}/compare/${comparison}`,
    publisher:     { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    keywords:      tags.join(", "),
  };

  return (
    <>
      <Script id="faq-schema"     type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Script id="article-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-fg mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/ai-tools" className="hover:text-foreground transition-colors">AI Tools</Link>
          <span>/</span>
          <span className="text-foreground">{tool1.name} vs {tool2.name}</span>
        </nav>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          {tool1.name} vs {tool2.name}
        </h1>
        <p className="text-muted-fg text-lg mb-10 leading-relaxed">{summary}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-10">
          {tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 text-xs rounded-full bg-muted text-muted-fg border border-border">
              {tag}
            </span>
          ))}
        </div>

        {/* Tool cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {[tool1, tool2].map((tool) => (
            <div key={tool.slug} className="rounded-2xl bg-card border border-border p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-lg">
                  {tool.name[0]}
                </div>
                <div>
                  <h2 className="font-bold leading-tight">{tool.name}</h2>
                  <a
                    href={tool.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-0.5"
                  >
                    Visit site <ExternalLink size={10} />
                  </a>
                </div>
              </div>
              <p className="text-sm text-muted-fg leading-relaxed">{tool.description}</p>
            </div>
          ))}
        </div>

        {/* Quick verdict */}
        <div className="rounded-2xl bg-accent/5 border border-accent/20 p-6 mb-12">
          <h2 className="font-bold text-lg mb-2">Quick Verdict</h2>
          <p className="text-sm text-muted-fg leading-relaxed">{summary}</p>
          <p className="text-sm text-muted-fg mt-3">
            <strong className="text-foreground">Bottom line:</strong> Try both free tiers and pick the one that fits your daily workflow.
            Most power users use <strong className="text-foreground">{tool1.name}</strong> and{" "}
            <strong className="text-foreground">{tool2.name}</strong> for different tasks.
          </p>
        </div>

        {/* FAQ section */}
        <div className="rounded-2xl bg-card border border-border p-6 mb-10">
          <h2 className="font-bold text-xl mb-6">
            {tool1.name} vs {tool2.name} — Common Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-semibold text-sm flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-accent shrink-0 mt-0.5" />
                  {faq.question}
                </h3>
                <p className="text-sm text-muted-fg mt-1.5 leading-relaxed pl-5">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related comparisons */}
        {(() => {
          const related = Object.entries(COMPARE_PAIRS)
            .filter(([slug]) => slug !== comparison)
            .slice(0, 4);
          if (related.length === 0) return null;
          return (
            <div>
              <h2 className="font-bold text-lg mb-4">Related Comparisons</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {related.map(([slug, p]) => (
                  <Link
                    key={slug}
                    href={`/compare/${slug}`}
                    className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border hover:border-accent/40 hover:bg-card transition-all text-sm font-medium"
                  >
                    {p.tool1.name} vs {p.tool2.name} →
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Back */}
        <div className="mt-10">
          <Link
            href="/ai-tools"
            className="inline-flex items-center gap-1.5 text-sm text-muted-fg hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} /> Back to AI Tools
          </Link>
        </div>

      </div>
    </>
  );
}
