import type { Metadata } from "next";
import { NewsletterCTA } from "@/components/home/NewsletterCTA";
import { siteConfig } from "@/config/site";
import { Mail, Zap, TrendingUp, Brain } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Newsletter — AI & Finance Intelligence Daily",
  description: "Subscribe to TechPulseGlobe's free newsletter. Get the best AI, Finance & Tech stories delivered to your inbox every morning.",
  alternates: { canonical: `${siteConfig.url}/newsletter` },
};

const BENEFITS = [
  { icon: Brain,      title: "AI Insights",      desc: "Daily AI research, model releases, and industry news" },
  { icon: TrendingUp, title: "Finance Updates",   desc: "Market analysis, SIP tips, and investing strategies" },
  { icon: Zap,        title: "Tech Briefing",     desc: "Cloud, AWS, startups, and developer tools" },
  { icon: Mail,       title: "Zero Spam",         desc: "One curated email per day. Unsubscribe anytime." },
];

export default function NewsletterPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Stay <span className="gradient-text">Ahead</span> of the Curve
        </h1>
        <p className="text-lg text-muted-fg max-w-xl mx-auto">
          Join India&apos;s growing community of tech &amp; finance professionals getting the best of AI, Finance, and Tech — free, every morning.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        {BENEFITS.map((b) => (
          <div key={b.title} className="flex flex-col items-center text-center p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 mb-3">
              <b.icon size={18} className="text-accent" />
            </div>
            <h3 className="font-semibold text-sm">{b.title}</h3>
            <p className="text-xs text-muted-fg mt-1">{b.desc}</p>
          </div>
        ))}
      </div>

      <NewsletterCTA />
    </div>
  );
}
