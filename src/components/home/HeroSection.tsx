import Link from "next/link";
import { ArrowRight, Brain, TrendingUp, Cpu, Rocket, Zap } from "lucide-react";
import { GradientText } from "@/components/shared/GradientText";
import { CategoryBadge } from "@/components/article/CategoryBadge";
import type { ArticlePreview } from "@/types";
import { formatRelativeDate } from "@/lib/utils";

const FLOATING_CARDS = [
  { icon: Brain,      label: "AI Intelligence",   color: "#60a5fa", desc: "Latest AI research & models" },
  { icon: TrendingUp, label: "Finance Insights",  color: "#34d399", desc: "Market analysis & SIP" },
  { icon: Cpu,        label: "Tech Deep Dives",   color: "#a78bfa", desc: "Engineering & infrastructure" },
  { icon: Rocket,     label: "Startup Intel",     color: "#f97316", desc: "Funding & founders" },
];

const STATS = [
  { value: "8",     label: "Categories" },
  { value: "Daily", label: "Updates" },
  { value: "Free",  label: "Newsletter" },
];

interface HeroSectionProps {
  featuredArticle?: ArticlePreview;
}

export function HeroSection({ featuredArticle }: HeroSectionProps) {
  return (
    <section className="relative pt-24 pb-6 overflow-hidden">
      {/* Noise texture overlay */}
      <div className="noise absolute inset-0 opacity-[0.025] pointer-events-none" />

      {/* Ambient glow blobs */}
      <div className="absolute -top-20 left-1/4 w-[600px] h-[400px] bg-accent/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-10 right-1/6 w-[400px] h-[300px] bg-accent-purple/6 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[200px] bg-accent-green/4 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[72vh]">

          {/* ── Left: Text Content — render immediately (no animation) for LCP ── */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/8 border border-accent/20 text-accent text-xs font-semibold mb-7 select-none">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
              </span>
              India&apos;s #1 AI + Finance Intelligence Platform
            </div>

            {/* Heading — LCP element, must be immediately visible */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight">
              <GradientText>Intelligence</GradientText>
              <br />
              <span className="text-foreground">for the</span>
              <br />
              <GradientText from="#a78bfa" to="#60a5fa">Future Builders</GradientText>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-muted-fg leading-relaxed max-w-lg">
              Premium AI, Finance &amp; Tech intelligence — deep analysis, real-time insights,
              and AI-powered summaries built for India&apos;s most ambitious professionals.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/ai"
                className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm
                  hover:bg-accent-hover transition-all shadow-lg shadow-accent/25
                  hover:shadow-accent/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                Explore AI News
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/newsletter"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-muted-fg
                  hover:text-foreground hover:border-accent/40 hover:bg-accent/5
                  transition-all text-sm font-medium"
              >
                Free Newsletter
              </Link>
            </div>

            {/* Stats — subtle staggered CSS animation */}
            <div className="flex gap-8 mt-10 pt-10 border-t border-border/60">
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  style={{ animation: `fade-up 0.4s ease ${0.4 + i * 0.08}s forwards`, opacity: 0 }}
                >
                  <p className="text-2xl font-bold text-foreground tabular-nums">{s.value}</p>
                  <p className="text-xs text-muted-fg mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Intelligence Cards — decorative, animate in ── */}
          <div
            className="relative hidden lg:block"
            style={{ animation: 'slide-in-right 0.65s cubic-bezier(0.22,1,0.36,1) 0.15s forwards', opacity: 0 }}
          >
            {/* Featured article card */}
            {featuredArticle?.category ? (
              <Link
                href={`/${featuredArticle.category.slug}/${featuredArticle.slug}`}
                className="group block glass rounded-2xl p-5 mb-4 border border-border/60
                  hover:border-accent/30 hover:shadow-lg hover:shadow-accent/10
                  transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CategoryBadge
                      slug={featuredArticle.category.slug}
                      name={featuredArticle.category.name}
                      asLink={false}
                    />
                    <h3 className="mt-2 font-semibold text-base line-clamp-2 group-hover:text-accent transition-colors leading-snug">
                      {featuredArticle.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted-fg line-clamp-2 leading-relaxed">
                      {featuredArticle.excerpt}
                    </p>
                  </div>
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent/20 transition-colors">
                    <Zap size={14} fill="currentColor" fillOpacity={0.3} />
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-fg">
                  {formatRelativeDate(featuredArticle.publishedAt)}
                </p>
              </Link>
            ) : (
              <div className="glass rounded-2xl p-5 mb-4 border border-border/60">
                <div className="h-4 w-20 skeleton rounded mb-3" />
                <div className="h-5 w-full skeleton rounded mb-2" />
                <div className="h-5 w-3/4 skeleton rounded mb-3" />
                <div className="h-3 w-24 skeleton rounded" />
              </div>
            )}

            {/* Intelligence category cards 2×2 grid */}
            <div className="grid grid-cols-2 gap-3">
              {FLOATING_CARDS.map((card, i) => (
                <div
                  key={card.label}
                  style={{ animation: `fade-up-scale 0.45s cubic-bezier(0.22,1,0.36,1) ${0.3 + i * 0.09}s forwards`, opacity: 0 }}
                  className="glass rounded-xl p-4 border border-border/60
                    hover:border-white/[0.12] hover:-translate-y-0.5
                    transition-all duration-200 cursor-default group"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 transition-colors"
                    style={{ backgroundColor: `${card.color}18` }}
                  >
                    <card.icon size={15} style={{ color: card.color }} />
                  </div>
                  <p className="text-sm font-semibold leading-tight">{card.label}</p>
                  <p className="text-xs text-muted-fg mt-0.5 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>

            {/* Grid lines decoration */}
            <div
              className="absolute -z-10 inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, #60a5fa 0px, transparent 1px, transparent 40px, #60a5fa 41px), repeating-linear-gradient(90deg, #60a5fa 0px, transparent 1px, transparent 40px, #60a5fa 41px)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
