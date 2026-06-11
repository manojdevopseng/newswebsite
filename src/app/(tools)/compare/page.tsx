import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GitCompare } from "lucide-react";
import { siteConfig } from "@/config/site";
import { COMPARE_PAIRS } from "@/config/compare";

export const metadata: Metadata = {
  title:       "AI Tool Comparisons 2025 — Side-by-Side Reviews | TechPulseGlobe",
  description: "Compare the best AI tools side by side — ChatGPT vs Claude, Midjourney vs DALL-E, GitHub Copilot vs Cursor, and more. Find the right AI tool for your needs.",
  alternates:  { canonical: `${siteConfig.url}/compare` },
  openGraph: {
    title:       "AI Tool Comparisons 2025 — Side-by-Side Reviews",
    description: "Compare the best AI tools side by side. Find the right AI tool for your needs.",
    url:         `${siteConfig.url}/compare`,
    siteName:    siteConfig.name,
    type:        "website",
  },
};

const TAG_COLORS: Record<string, string> = {
  "AI chatbot":        "bg-blue-500/10   text-blue-400   border-blue-500/20",
  "AI image generator":"bg-purple-500/10 text-purple-400 border-purple-500/20",
  "AI coding":         "bg-green-500/10  text-green-400  border-green-500/20",
  "AI writing":        "bg-amber-500/10  text-amber-400  border-amber-500/20",
  "AI search":         "bg-cyan-500/10   text-cyan-400   border-cyan-500/20",
};

function tagClass(tag: string) {
  return TAG_COLORS[tag] ?? "bg-muted text-muted-fg border-border";
}

export default function ComparePage() {
  const pairs = Object.entries(COMPARE_PAIRS);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-fg mb-10">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <Link href="/ai-tools" className="hover:text-foreground transition-colors">AI Tools</Link>
        <span>/</span>
        <span className="text-foreground">Compare</span>
      </nav>

      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 mb-5">
          <GitCompare size={24} className="text-accent" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          AI Tool Comparisons
        </h1>
        <p className="text-muted-fg text-lg max-w-2xl mx-auto">
          Honest, side-by-side comparisons of the most popular AI tools in 2025 — so you can
          choose the right one without the guesswork.
        </p>
      </div>

      {/* Comparison cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
        {pairs.map(([slug, pair]) => (
          <Link
            key={slug}
            href={`/compare/${slug}`}
            className="group flex flex-col gap-4 p-6 rounded-2xl bg-card border border-border
              hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all"
          >
            {/* Tool name row */}
            <div className="flex items-center gap-3">
              {/* Tool 1 */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center
                  text-accent font-bold text-sm shrink-0">
                  {pair.tool1.name[0]}
                </div>
                <span className="font-semibold text-sm truncate">{pair.tool1.name}</span>
              </div>

              <span className="text-xs font-bold text-muted-fg shrink-0">VS</span>

              {/* Tool 2 */}
              <div className="flex items-center gap-2 flex-1 min-w-0 flex-row-reverse">
                <div className="w-9 h-9 rounded-xl bg-accent-purple/10 flex items-center justify-center
                  text-accent-purple font-bold text-sm shrink-0">
                  {pair.tool2.name[0]}
                </div>
                <span className="font-semibold text-sm truncate text-right">{pair.tool2.name}</span>
              </div>
            </div>

            {/* Summary */}
            <p className="text-xs text-muted-fg leading-relaxed line-clamp-2">
              {pair.summary}
            </p>

            {/* Tags + CTA */}
            <div className="flex items-center justify-between gap-2 mt-auto">
              <div className="flex flex-wrap gap-1.5">
                {pair.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${tagClass(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-xs text-accent font-medium flex items-center gap-1
                group-hover:gap-2 transition-all shrink-0">
                Compare <ArrowRight size={12} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center p-8 rounded-2xl bg-card border border-border">
        <h2 className="font-bold text-lg mb-2">Looking for a specific comparison?</h2>
        <p className="text-sm text-muted-fg mb-4">
          Browse our full AI tools directory to find reviews and comparisons for any AI tool.
        </p>
        <Link
          href="/ai-tools"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white
            text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Browse AI Tools Directory <ArrowRight size={14} />
        </Link>
      </div>

    </div>
  );
}
