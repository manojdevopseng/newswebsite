import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import { Check, X, Star, ExternalLink, ArrowLeft } from "lucide-react";
import { aiToolSchema, faqSchema } from "@/lib/seo/schema";
import { siteConfig } from "@/config/site";
import type { AITool } from "@/types";

interface Params { slug: string }

async function getTool(slug: string): Promise<AITool | null> {
  try {
    const { getBaseUrl } = await import("@/lib/utils");
    const res = await fetch(`${getBaseUrl()}/api/ai-tools/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getTool(slug);
  if (!tool) return { title: "Tool Not Found" };
  const ogImage = (tool as any).logo || `${siteConfig.url}${siteConfig.ogImage}`
  return {
    title: `${tool.name} Review 2025 — Pricing, Features & Alternatives`,
    description: tool.description,
    alternates: { canonical: `${siteConfig.url}/ai-tools/${slug}` },
    openGraph: {
      title:       `${tool.name} Review 2025 — Pricing, Features & Alternatives`,
      description: tool.description,
      url:         `${siteConfig.url}/ai-tools/${slug}`,
      siteName:    siteConfig.name,
      type:        'article',
      images:      [{ url: ogImage, width: 1200, height: 630, alt: tool.name }],
    },
    twitter: {
      card:        'summary_large_image',
      title:       `${tool.name} Review 2025 — Pricing, Features & Alternatives`,
      description: tool.description,
      images:      [ogImage],
    },
  };
}

const PRICING_BADGE: Record<string, { label: string; color: string }> = {
  free: { label: "Free", color: "#34d399" },
  freemium: { label: "Freemium", color: "#60a5fa" },
  paid: { label: "Paid", color: "#a78bfa" },
  enterprise: { label: "Enterprise", color: "#f97316" },
};

export default async function AIToolDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const tool = await getTool(slug);
  if (!tool) notFound();

  const schema = aiToolSchema(tool);
  const faqs = [
    { question: `Is ${tool.name} free?`, answer: tool.pricing === "free" ? `Yes, ${tool.name} is completely free.` : `${tool.name} offers a ${tool.pricing} plan. ${tool.pricingDetails || ""}` },
    { question: `What can I use ${tool.name} for?`, answer: `${tool.name} can be used for: ${tool.features.join(", ")}.` },
    { question: `What are the main pros of ${tool.name}?`, answer: tool.pros.join(". ") },
  ];

  const badge = PRICING_BADGE[tool.pricing];

  return (
    <>
      <Script id="tool-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/ai-tools" className="inline-flex items-center gap-1.5 text-sm text-muted-fg hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={14} /> Back to AI Tools
        </Link>

        {/* Tool header */}
        <div className="flex items-start gap-5 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent text-2xl font-bold shrink-0">
            {tool.name[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold">{tool.name}</h1>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${badge.color}18`, color: badge.color }}>
                {badge.label}
              </span>
            </div>
            <p className="mt-2 text-muted-fg">{tool.tagline || tool.description}</p>
            <div className="flex items-center gap-4 mt-3">
              {tool.rating > 0 && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className={i < Math.round(tool.rating) ? "text-accent-yellow fill-current" : "text-border"} />
                  ))}
                  <span className="text-sm font-semibold ml-1">{tool.rating.toFixed(1)}</span>
                </div>
              )}
              <a href={tool.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-accent hover:underline">
                Visit {tool.name} <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-base text-muted-fg leading-relaxed mb-8 p-5 rounded-2xl bg-card border border-border">
          {tool.description}
        </p>

        {/* Features + Pros/Cons grid */}
        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          {/* Features */}
          <div className="sm:col-span-1 rounded-2xl bg-card border border-border p-5">
            <h2 className="font-semibold mb-3">Key Features</h2>
            <ul className="space-y-2">
              {tool.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-fg">
                  <Check size={14} className="text-accent-green mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pros */}
          <div className="rounded-2xl bg-card border border-border p-5">
            <h2 className="font-semibold mb-3 text-accent-green">Pros</h2>
            <ul className="space-y-2">
              {tool.pros.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-muted-fg">
                  <Check size={14} className="text-accent-green mt-0.5 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div className="rounded-2xl bg-card border border-border p-5">
            <h2 className="font-semibold mb-3 text-accent-orange">Cons</h2>
            <ul className="space-y-2">
              {tool.cons.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm text-muted-fg">
                  <X size={14} className="text-accent-orange mt-0.5 shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ */}
        <div className="rounded-2xl bg-card border border-border p-6">
          <h2 className="font-bold text-xl mb-5">Frequently Asked Questions</h2>
          <div className="space-y-5">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-semibold text-sm">{faq.question}</h3>
                <p className="text-sm text-muted-fg mt-1 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <a
            href={tool.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20"
          >
            Try {tool.name} Free <ExternalLink size={15} />
          </a>
        </div>
      </div>
    </>
  );
}
