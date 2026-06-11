import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Search } from "lucide-react";
import { siteConfig } from "@/config/site";
import { GLOSSARY, GLOSSARY_CATEGORIES, getTermsByCategory } from "@/config/glossary";

export const metadata: Metadata = {
  title:       `Finance & AI Glossary — Key Terms Explained | ${siteConfig.name}`,
  description: "Plain-English definitions for 50+ finance, AI, investing, and tech terms — from SIP and Mutual Funds to LLMs, RAG, Blockchain, and more.",
  alternates:  { canonical: `${siteConfig.url}/glossary` },
  openGraph: {
    title:       "Finance & AI Glossary — Key Terms Explained",
    description: "Plain-English definitions for 50+ finance, AI, investing, and tech terms.",
    url:         `${siteConfig.url}/glossary`,
    siteName:    siteConfig.name,
    type:        "website",
  },
};

const CATEGORY_META: Record<string, { label: string; description: string; color: string }> = {
  AI:         { label: "Artificial Intelligence", description: "LLMs, transformers, RAG, and more",     color: "text-blue-400"   },
  Finance:    { label: "Finance & Markets",        description: "Mutual funds, NAV, SEBI, ETFs",        color: "text-emerald-400" },
  Investing:  { label: "Investing",                description: "Strategies, lump sum, SIP basics",     color: "text-green-400"   },
  Technology: { label: "Technology",               description: "APIs, cloud computing, infra",         color: "text-purple-400"  },
  Crypto:     { label: "Crypto & Web3",            description: "Blockchain, DeFi, NFTs",               color: "text-yellow-400"  },
};

export default function GlossaryPage() {
  const totalTerms = Object.keys(GLOSSARY).length;

  // JSON-LD DefinedTermSet
  const termSetSchema = {
    "@context": "https://schema.org",
    "@type":    "DefinedTermSet",
    name:       `${siteConfig.name} Finance & AI Glossary`,
    description: "Plain-English definitions for finance, AI, investing, and technology terms.",
    url:        `${siteConfig.url}/glossary`,
    hasDefinedTerm: Object.entries(GLOSSARY).map(([slug, entry]) => ({
      "@type":     "DefinedTerm",
      name:        entry.title,
      description: entry.definition.slice(0, 120),
      url:         `${siteConfig.url}/glossary/${slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termSetSchema) }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-fg mb-10">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <span className="text-foreground">Glossary</span>
        </nav>

        {/* Hero header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 mb-5">
            <BookOpen size={24} className="text-accent" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Finance & AI Glossary
          </h1>
          <p className="text-muted-fg text-lg max-w-2xl mx-auto">
            Plain-English definitions for <span className="text-foreground font-semibold">{totalTerms}+ terms</span> across
            finance, AI, investing, technology, and crypto.
          </p>
        </div>

        {/* Quick search hint */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border mb-12 text-sm text-muted-fg">
          <Search size={15} className="shrink-0" />
          <span>
            Use <kbd className="px-1.5 py-0.5 text-xs rounded bg-card border border-border font-mono">Ctrl+F</kbd> to
            search this page, or browse by category below.
          </span>
        </div>

        {/* Categories */}
        {GLOSSARY_CATEGORIES.map((cat) => {
          const terms = getTermsByCategory(cat);
          if (terms.length === 0) return null;
          const meta = CATEGORY_META[cat];

          return (
            <section key={cat} className="mb-14" id={cat.toLowerCase()}>
              {/* Category heading */}
              <div className="flex items-center gap-3 mb-6">
                <div>
                  <h2 className={`text-xl font-bold ${meta.color}`}>{meta.label}</h2>
                  <p className="text-sm text-muted-fg">{meta.description}</p>
                </div>
                <span className="ml-auto text-xs text-muted-fg border border-border rounded-full px-2.5 py-1">
                  {terms.length} {terms.length === 1 ? "term" : "terms"}
                </span>
              </div>

              {/* Term cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {terms
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([slug, entry]) => (
                    <Link
                      key={slug}
                      href={`/glossary/${slug}`}
                      className="group flex flex-col gap-1.5 p-4 rounded-xl bg-card border border-border hover:border-accent/40 hover:bg-card/80 transition-all"
                    >
                      <span className="font-semibold text-sm group-hover:text-accent transition-colors leading-snug">
                        {entry.title}
                      </span>
                      <span className="text-xs text-muted-fg line-clamp-2 leading-relaxed">
                        {entry.definition.slice(0, 100)}…
                      </span>
                    </Link>
                  ))}
              </div>
            </section>
          );
        })}

        {/* A–Z full list */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-6">All Terms (A–Z)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {Object.entries(GLOSSARY)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([slug, entry]) => (
                <Link
                  key={slug}
                  href={`/glossary/${slug}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-fg hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  <span className="w-5 h-5 flex items-center justify-center rounded bg-accent/10 text-accent text-[10px] font-bold shrink-0">
                    {entry.title[0].toUpperCase()}
                  </span>
                  {entry.title}
                </Link>
              ))}
          </div>
        </section>

      </div>
    </>
  );
}
