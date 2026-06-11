"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { GoogleAd, HAS_REAL_ADSENSE } from "./GoogleAd";

interface AdBannerProps {
  slot:      string;
  size?:     "leaderboard" | "mobile-banner" | "large-leaderboard";
  className?: string;
}

const SIZE_MAP = {
  "leaderboard":       { width: 728, height: 90,  mobileWidth: 320, mobileHeight: 50 },
  "mobile-banner":     { width: 320, height: 50,  mobileWidth: 320, mobileHeight: 50 },
  "large-leaderboard": { width: 970, height: 90,  mobileWidth: 320, mobileHeight: 50 },
} as const;

// AdSense slot IDs are always numeric strings (8-10 digits)
const isValidSlot = (s: string) => /^\d{6,12}$/.test(s);

export function AdBanner({ slot, size = "leaderboard", className }: AdBannerProps) {
  const ref     = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const dims    = SIZE_MAP[size];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { rootMargin: "200px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  if (!HAS_REAL_ADSENSE || !isValidSlot(slot)) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/30",
        "text-xs text-muted-fg",
        className
      )}
      style={{ minHeight: dims.mobileHeight, maxWidth: "100%" }}
      aria-label="Advertisement"
    >
      {visible ? (
        HAS_REAL_ADSENSE ? (
          /* Real AdSense unit */
          <div className="w-full">
            <p className="text-[10px] uppercase tracking-widest text-muted-fg/50 text-center pt-2">Advertisement</p>
            <GoogleAd slot={slot} format="auto" responsive />
          </div>
        ) : (
          /* Placeholder shown in dev / before AdSense approval */
          <div className="text-center p-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-fg/50 mb-1">Advertisement</p>
            <div
              className="bg-muted/50 rounded-lg mx-auto"
              style={{ width: "100%", maxWidth: dims.mobileWidth, height: dims.mobileHeight }}
            />
          </div>
        )
      ) : (
        /* Reserved space — prevents CLS */
        <div style={{ height: dims.mobileHeight }} />
      )}
    </div>
  );
}
