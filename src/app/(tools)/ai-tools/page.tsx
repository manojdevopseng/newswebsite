import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Star } from "lucide-react";
import { siteConfig } from "@/config/site";
import type { AITool } from "@/types";

export const metadata: Metadata = {
  title: "AI Tools Directory 2025 — Best AI Tools Reviewed",
  description: "Comprehensive directory of the best AI tools for productivity, writing, coding, design, and business. Expert reviews and comparisons.",
  alternates: { canonical: `${siteConfig.url}/ai-tools` },
  openGraph: {
    title:       "AI Tools Directory 2025 — Best AI Tools Reviewed",
    description: "Comprehensive directory of the best AI tools for productivity, writing, coding, design, and business. Expert reviews and comparisons.",
    url:         `${siteConfig.url}/ai-tools`,
    siteName:    siteConfig.name,
    type:        'website',
    images:      [{ url: `${siteConfig.url}${siteConfig.ogImage}`, width: 1200, height: 630, alt: 'AI Tools Directory — TechPulseGlobe' }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       "AI Tools Directory 2025 — Best AI Tools Reviewed",
    description: "Comprehensive directory of the best AI tools for productivity, writing, coding, design, and business.",
    images:      [`${siteConfig.url}${siteConfig.ogImage}`],
  },
};

async function getAITools(): Promise<AITool[]> {
  try {
    const { getBaseUrl } = await import("@/lib/utils");
    const res = await fetch(`${getBaseUrl()}/api/ai-tools`, { next: { revalidate: 3600 } });
    if (!res.ok) return DEMO_TOOLS;
    const json = await res.json();
    return json.data ?? DEMO_TOOLS;
  } catch { return DEMO_TOOLS; }
}

const PRICING_COLORS: Record<string, string> = {
  free: "#34d399",
  freemium: "#60a5fa",
  paid: "#a78bfa",
  enterprise: "#f97316",
};

export default async function AIToolsPage() {
  const tools = await getAITools();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold">AI Tools Directory</h1>
        <p className="mt-3 text-lg text-muted-fg">
          {tools.length}+ AI tools reviewed and compared. Find the best tools for your workflow.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {tools.map((tool) => (
          <Link
            key={tool._id}
            href={`/ai-tools/${tool.slug}`}
            className="group flex flex-col rounded-2xl bg-card border border-border p-5 card-glow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {tool.logo ? (
                  <Image src={tool.logo} alt={tool.name} width={40} height={40} className="rounded-xl" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold">
                    {tool.name[0]}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold group-hover:text-accent transition-colors">{tool.name}</h3>
                  <span
                    className="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: `${PRICING_COLORS[tool.pricing]}18`, color: PRICING_COLORS[tool.pricing] }}
                  >
                    {tool.pricing}
                  </span>
                </div>
              </div>
              {tool.rating > 0 && (
                <div className="flex items-center gap-1 text-xs text-accent-yellow font-semibold">
                  <Star size={12} fill="currentColor" />
                  {tool.rating.toFixed(1)}
                </div>
              )}
            </div>
            <p className="text-sm text-muted-fg line-clamp-2 flex-1">{tool.description}</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-muted-fg">{tool.category}</span>
              <ExternalLink size={13} className="text-muted-fg group-hover:text-accent transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Demo data for static rendering when DB is unavailable
const DEMO_TOOLS: AITool[] = [
  { _id: "1", name: "ChatGPT", slug: "chatgpt", description: "OpenAI's powerful conversational AI for writing, coding, and analysis.", tagline: "The world's most popular AI assistant", category: "Conversational AI", pricing: "freemium", features: ["GPT-4o", "Code interpreter", "Image generation", "Plugins"], pros: ["Best-in-class reasoning", "Huge plugin ecosystem"], cons: ["Rate limits on free tier"], rating: 4.8, website: "https://chat.openai.com", logo: "", lastReviewed: new Date().toISOString() },
  { _id: "2", name: "Claude", slug: "claude", description: "Anthropic's AI assistant excelling at long-form writing and nuanced reasoning.", tagline: "Constitutional AI for safe, helpful responses", category: "Conversational AI", pricing: "freemium", features: ["200K context window", "Code generation", "Document analysis"], pros: ["Exceptional writing quality", "Large context window"], cons: ["Fewer integrations"], rating: 4.7, website: "https://claude.ai", logo: "", lastReviewed: new Date().toISOString() },
  { _id: "3", name: "Midjourney", slug: "midjourney", description: "Industry-leading AI image generation with stunning artistic quality.", tagline: "Create stunning AI art", category: "Image Generation", pricing: "paid", features: ["High-quality images", "V6 model", "Style tuning"], pros: ["Best image quality", "Active community"], cons: ["Discord-only", "No free tier"], rating: 4.6, website: "https://midjourney.com", logo: "", lastReviewed: new Date().toISOString() },
];
