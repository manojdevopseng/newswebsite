import type { Metadata } from "next";
import Link from "next/link";
import { Zap, Target, Users, Globe, TrendingUp, Shield } from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About Us | TechPulseGlobe — AI, Finance & Tech Intelligence",
  description:
    "TechPulseGlobe is India's premium AI-powered media intelligence platform covering Artificial Intelligence, Finance, Technology, Startups, and Investing for ambitious professionals.",
  alternates: { canonical: `${siteConfig.url}/about` },
  openGraph: {
    title:       "About Us | TechPulseGlobe — AI, Finance & Tech Intelligence",
    description: "TechPulseGlobe is India's premium AI-powered media intelligence platform covering AI, Finance, Technology, Startups, and Investing.",
    url:         `${siteConfig.url}/about`,
    siteName:    siteConfig.name,
    type:        "website",
    images:      [{ url: `${siteConfig.url}${siteConfig.ogImage}`, width: 1200, height: 630, alt: "About TechPulseGlobe" }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "About Us | TechPulseGlobe",
    description: "India's premium AI-powered media intelligence platform.",
    images:      [`${siteConfig.url}${siteConfig.ogImage}`],
  },
};

const values = [
  {
    icon: Target,
    title: "Original Analysis",
    desc: "Every article goes beyond headlines — we add data, India-specific context, and expert analysis you won't find anywhere else.",
  },
  {
    icon: Shield,
    title: "Editorial Independence",
    desc: "Our editorial team is fully independent. We do not accept sponsored content disguised as news. Sponsored posts are clearly labeled.",
  },
  {
    icon: Globe,
    title: "India-First Perspective",
    desc: "Global AI and tech news filtered through an Indian lens — what it means for Indian investors, startups, and professionals.",
  },
  {
    icon: TrendingUp,
    title: "Data-Driven",
    desc: "We back our analysis with real data — SEBI filings, NSE/BSE figures, AMFI reports, and primary research from global institutions.",
  },
];

const stats = [
  { value: "12",   label: "Coverage Categories" },
  { value: "2025", label: "Year Founded" },
  { value: "Daily",  label: "Publishing Frequency" },
  { value: "Free",   label: "Always Free to Read" },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-fg mb-10">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground">About Us</span>
      </nav>

      {/* Hero */}
      <div className="mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/8 border border-accent/20 text-accent text-xs font-semibold mb-6">
          <Zap size={12} fill="currentColor" fillOpacity={0.4} />
          About TechPulseGlobe
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight mb-6">
          Intelligence for{" "}
          <span className="gradient-text">India's Future Builders</span>
        </h1>
        <p className="text-lg text-muted-fg leading-relaxed max-w-2xl">
          TechPulseGlobe is a premium digital media platform covering Artificial Intelligence,
          Finance, Technology, Startups, and Investing — built specifically for India's most
          ambitious professionals, founders, and investors.
        </p>
      </div>

      {/* Mission */}
      <section className="mb-14 p-8 rounded-2xl bg-card border border-border">
        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
        <p className="text-muted-fg leading-relaxed mb-4">
          We believe the best decisions are made by people who are well-informed. Yet most
          Indian professionals lack access to high-quality, jargon-free intelligence on the
          topics that matter most — AI breakthroughs, market-moving finance news, startup
          funding, and cloud technology.
        </p>
        <p className="text-muted-fg leading-relaxed">
          TechPulseGlobe bridges that gap. We translate complex global developments into clear,
          actionable insights — with an India-first perspective, always.
        </p>
      </section>

      {/* Stats */}
      <section className="mb-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="p-5 rounded-xl bg-card border border-border text-center">
              <p className="text-3xl font-bold gradient-text mb-1">{s.value}</p>
              <p className="text-xs text-muted-fg">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What We Cover */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-6">What We Cover</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { cat: "Artificial Intelligence", desc: "LLM releases, AI research, model benchmarks, and industry impact", color: "#60a5fa" },
            { cat: "Finance & Markets",       desc: "Stock markets, RBI policy, macroeconomic trends, and fintech",    color: "#34d399" },
            { cat: "Technology",              desc: "Engineering deep-dives, software releases, and infrastructure",   color: "#a78bfa" },
            { cat: "Startups",                desc: "Indian and global startup funding, founders, and ecosystem news", color: "#f97316" },
            { cat: "Investing",               desc: "Mutual funds, SIP strategies, equities, and wealth building",     color: "#4ade80" },
            { cat: "Cloud & AWS",             desc: "Cloud computing, AWS/GCP/Azure launches, and DevOps",            color: "#fb923c" },
            { cat: "AI Tools",                desc: "Reviews and comparisons of the latest AI productivity tools",     color: "#22d3ee" },
            { cat: "Crypto & Web3",           desc: "Blockchain developments, cryptocurrency markets, and DeFi",      color: "#f59e0b" },
          ].map((item) => (
            <div key={item.cat} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
              <span className="mt-1 h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <div>
                <p className="font-semibold text-sm" style={{ color: item.color }}>{item.cat}</p>
                <p className="text-xs text-muted-fg mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-6">Our Editorial Values</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {values.map((v) => (
            <div key={v.title} className="p-6 rounded-xl bg-card border border-border">
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <v.icon size={16} className="text-accent" />
              </div>
              <h3 className="font-semibold mb-2">{v.title}</h3>
              <p className="text-sm text-muted-fg leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mb-14 p-8 rounded-2xl bg-card border border-border">
        <h2 className="text-2xl font-bold mb-4">Our Team</h2>
        <p className="text-muted-fg leading-relaxed mb-4">
          TechPulseGlobe is built and maintained by a team of journalists, engineers, and
          analysts who are passionate about technology and finance. Our editorial team has
          backgrounds spanning financial markets, AI research, and software engineering.
        </p>
        <p className="text-muted-fg leading-relaxed">
          We are based in India and write primarily for the Indian professional audience,
          while maintaining relevance for global English-speaking readers interested in
          India's technology and finance ecosystem.
        </p>
      </section>

      {/* Advertising */}
      <section className="mb-14 p-8 rounded-2xl bg-card border border-border">
        <h2 className="text-2xl font-bold mb-4">Advertising & Sponsorships</h2>
        <p className="text-muted-fg leading-relaxed mb-4">
          TechPulseGlobe is supported by display advertising through Google AdSense and direct
          brand partnerships. All sponsored or promotional content is clearly disclosed and
          labeled as "Sponsored" or "Promoted."
        </p>
        <p className="text-muted-fg leading-relaxed">
          We never allow advertising relationships to influence our editorial coverage.
          For advertising and partnership enquiries, please reach out via our{" "}
          <Link href="/contact" className="text-accent hover:underline">Contact page</Link>.
        </p>
      </section>

      {/* CTA */}
      <div className="text-center p-8 rounded-2xl border border-accent/20 bg-accent/5">
        <h2 className="text-xl font-bold mb-3">Stay Informed</h2>
        <p className="text-muted-fg mb-6 text-sm">
          Get the best of TechPulseGlobe delivered to your inbox — free, every week.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/newsletter"
            className="px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-all"
          >
            Subscribe to Newsletter
          </Link>
          <Link
            href="/contact"
            className="px-5 py-2.5 rounded-xl border border-border text-muted-fg font-medium text-sm hover:text-foreground hover:border-accent/40 transition-all"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
