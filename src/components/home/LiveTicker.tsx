"use client";

import { useState } from "react";

const FALLBACK_HEADLINES = [
  "🤖 Latest AI developments and breakthroughs",
  "📈 Market analysis and financial insights",
  "💻 Technology news and innovations",
  "🚀 Startup ecosystem updates",
  "🔗 Crypto and blockchain news",
  "☁️ Cloud computing and AWS updates",
];

interface LiveTickerProps {
  headlines?: string[];
}

export function LiveTicker({ headlines }: LiveTickerProps) {
  const [paused, setPaused] = useState(false);

  const items = headlines && headlines.length > 0 ? headlines : FALLBACK_HEADLINES;
  // Double the list so the marquee loops seamlessly
  const doubled = [...items, ...items];

  return (
    <div
      className="relative flex items-center bg-card/60 border-y border-border overflow-hidden"
      style={{ height: "38px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Left fade + LIVE badge */}
      <div className="relative z-10 flex items-center gap-2 px-4 shrink-0 h-full bg-card/90 backdrop-blur-sm border-r border-border">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-orange opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-orange" />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent-orange select-none">
          Live
        </span>
      </div>

      {/* Left gradient fade */}
      <div className="absolute left-[72px] top-0 bottom-0 w-10 bg-gradient-to-r from-card/80 to-transparent z-10 pointer-events-none" />

      {/* Scrolling strip */}
      <div className="flex-1 overflow-hidden">
        <div
          className="flex gap-12 whitespace-nowrap"
          style={{
            animation: paused ? "none" : "ticker 70s linear infinite",
            willChange: "transform",
          }}
        >
          {doubled.map((h, i) => (
            <span
              key={i}
              className="text-xs text-muted-fg hover:text-foreground transition-colors cursor-default shrink-0 py-2"
            >
              <span className="mr-6 text-border select-none">·</span>
              {h}
            </span>
          ))}
        </div>
      </div>

      {/* Right gradient fade */}
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-card/80 to-transparent z-10 pointer-events-none" />
    </div>
  );
}
