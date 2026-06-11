import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { faqSchema } from "@/lib/seo/schema";
import { siteConfig } from "@/config/site";
import { GLOSSARY } from "@/config/glossary";

interface Params { term: string }

const CATEGORY_LABELS: Record<string, string> = {
  AI:         "Artificial Intelligence",
  Finance:    "Finance",
  Investing:  "Investing",
  Technology: "Technology",
  Crypto:     "Crypto & Web3",
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { term } = await params;
  const entry = GLOSSARY[term];
  if (!entry) return { title: "Term Not Found" };
  return {
    title: `${entry.title} — Finance & AI Glossary | ${siteConfig.name}`,
    description: entry.definition.slice(0, 160),
    alternates: { canonical: `${siteConfig.url}/glossary/${term}` },
    openGraph: {
      title:       `${entry.title} — Finance & AI Glossary`,
      description: entry.definition.slice(0, 160),
      url:         `${siteConfig.url}/glossary/${term}`,
      siteName:    siteConfig.name,
      type:        "article",
      images:      [{ url: `${siteConfig.url}${siteConfig.ogImage}`, width: 1200, height: 630, alt: `${entry.title} — TechPulseGlobe Glossary` }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       `${entry.title} — Finance & AI Glossary`,
      description: entry.definition.slice(0, 160),
      images:      [`${siteConfig.url}${siteConfig.ogImage}`],
    },
  };
}

export function generateStaticParams() {
  return Object.keys(GLOSSARY).map((term) => ({ term }));
}

export default async function GlossaryTermPage({ params }: { params: Promise<Params> }) {
  const { term } = await params;
  const entry = GLOSSARY[term];
  if (!entry) notFound();

  const faqs = [
    { question: `What is ${entry.title}?`,                   answer: entry.definition },
    { question: `Can you give an example of ${entry.title}?`, answer: entry.example },
    { question: `What are terms related to ${entry.title}?`,  answer: `Terms related to ${entry.title}: ${entry.relatedTerms.join(", ")}.` },
  ];

  // JSON-LD: DefinedTerm
  const definedTermSchema = {
    "@context":  "https://schema.org",
    "@type":     "DefinedTerm",
    name:        entry.title,
    description: entry.definition,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name:    `${siteConfig.name} Finance & AI Glossary`,
      url:     `${siteConfig.url}/glossary`,
    },
  };

  return (
    <>
      <Script id="faq-schema"          type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
      <Script id="defined-term-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-fg mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/glossary" className="hover:text-foreground transition-colors">Glossary</Link>
          <span>/</span>
          <span className="text-foreground">{entry.title}</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent/10">
            <BookOpen size={16} className="text-accent" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-fg">
            {CATEGORY_LABELS[entry.category] ?? entry.category}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-6">{entry.title}</h1>

        {/* Definition */}
        <div className="prose dark:prose-invert prose-lg max-w-none mb-8">
          <p>{entry.definition}</p>
          <h2>Example</h2>
          <blockquote>{entry.example}</blockquote>
        </div>

        {/* Related Terms */}
        {entry.relatedTerms.length > 0 && (
          <div className="rounded-2xl bg-card border border-border p-5 mb-8">
            <h2 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-fg">Related Terms</h2>
            <div className="flex flex-wrap gap-2">
              {entry.relatedTerms.map((t) => (
                <Link
                  key={t}
                  href={`/glossary/${t}`}
                  className="px-3 py-1.5 text-sm rounded-full bg-muted text-muted-fg hover:text-foreground hover:bg-border transition-colors capitalize"
                >
                  {GLOSSARY[t]?.title ?? t.replace(/-/g, " ")}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <Link
          href="/glossary"
          className="inline-flex items-center gap-1.5 text-sm text-muted-fg hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> Back to Glossary
        </Link>
      </div>
    </>
  );
}
