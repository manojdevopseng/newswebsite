import type { Metadata } from "next";
import { Search } from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Search — Find Articles, AI Tools & More",
  description: "Search thousands of articles on AI, Finance, Technology, Startups, and more.",
  alternates: { canonical: `${siteConfig.url}/search` },
  robots: {
    index:  false,
    follow: true,
  },
};

export default function SearchPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mx-auto mb-6">
        <Search size={28} className="text-accent" />
      </div>
      <h1 className="text-3xl font-bold mb-3">Search TechPulseGlobe</h1>
      <p className="text-muted-fg mb-8">
        Use the search bar above (<kbd className="px-2 py-0.5 rounded bg-muted text-xs">Cmd K</kbd>) to instantly search thousands of articles on AI, Finance, and Technology.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {["GPT-5", "Nifty 50", "AI automation", "AWS Lambda", "startup funding", "mutual funds"].map((q) => (
          <a
            key={q}
            href={`/search?q=${encodeURIComponent(q)}`}
            className="px-3 py-1.5 text-sm rounded-full bg-muted text-muted-fg hover:text-foreground hover:bg-border transition-colors"
          >
            {q}
          </a>
        ))}
      </div>
    </div>
  );
}

