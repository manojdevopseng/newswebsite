"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { GoogleAd, HAS_REAL_ADSENSE } from "./GoogleAd";

interface ArticleAdProps {
  slot?:      string;
  className?: string;
}

const DEFAULT_SLOT = process.env.NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT ?? "";

export function ArticleAd({ slot, className }: ArticleAdProps) {
  const ref     = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const adSlot  = slot ?? DEFAULT_SLOT;

  // Don't render anything until AdSense is approved and NEXT_PUBLIC_ADS_ENABLED=true
  if (!HAS_REAL_ADSENSE || !adSlot) return null;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { rootMargin: "100px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "my-8 flex items-center justify-center rounded-xl border border-border bg-muted/20",
        className
      )}
      style={{ minHeight: 90 }}
      aria-label="Advertisement"
    >
      {visible ? (
        HAS_REAL_ADSENSE && adSlot ? (
          <div className="w-full max-w-2xl mx-auto p-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-fg/50 text-center mb-1">Advertisement</p>
            <GoogleAd slot={adSlot} format="fluid" layout="in-article" responsive />
          </div>
        ) : (
          <div className="text-center p-3 w-full max-w-2xl mx-auto">
            <p className="text-[10px] uppercase tracking-widest text-muted-fg/50 mb-2">Advertisement</p>
            <div className="h-[90px] bg-muted/50 rounded-lg skeleton mx-auto" style={{ maxWidth: 728 }} />
          </div>
        )
      ) : (
        <div style={{ height: 90 }} />
      )}
    </div>
  );
}
