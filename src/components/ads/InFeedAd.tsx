"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { GoogleAd, HAS_REAL_ADSENSE } from "./GoogleAd";

interface InFeedAdProps {
  slot?:      string;
  className?: string;
}

const DEFAULT_SLOT       = process.env.NEXT_PUBLIC_ADSENSE_INFEED_SLOT ?? "";
const DEFAULT_LAYOUT_KEY = process.env.NEXT_PUBLIC_ADSENSE_INFEED_LAYOUT_KEY ?? "";

export function InFeedAd({ slot, className }: InFeedAdProps) {
  const ref     = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const adSlot  = slot ?? DEFAULT_SLOT;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { rootMargin: "200px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  if (!HAS_REAL_ADSENSE || !adSlot) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col rounded-2xl overflow-hidden bg-card border border-border/50",
        className
      )}
      style={{ minHeight: 200 }}
      aria-label="Sponsored content"
    >
      {visible ? (
        HAS_REAL_ADSENSE && adSlot ? (
          /* Real in-feed AdSense unit */
          <div className="flex-1 flex flex-col">
            <p className="text-[10px] uppercase tracking-widest text-muted-fg/60 font-semibold text-center pt-3">
              Sponsored
            </p>
            <GoogleAd slot={adSlot} format="fluid" responsive style={{ flex: 1 }} layoutKey={DEFAULT_LAYOUT_KEY || undefined} />
          </div>
        ) : (
          /* Placeholder */
          <div className="flex flex-col flex-1 p-4 items-center justify-center text-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-widest text-muted-fg/60 font-semibold">Sponsored</span>
              <ExternalLink size={10} className="text-muted-fg/40" />
            </div>
            <div className="w-full h-24 rounded-xl bg-muted/50 skeleton" />
            <div className="w-3/4 h-3 rounded skeleton" />
            <div className="w-1/2 h-3 rounded skeleton" />
          </div>
        )
      ) : (
        <div style={{ minHeight: 200 }} />
      )}
    </div>
  );
}
